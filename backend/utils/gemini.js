const { Client } = require('@gradio/client');

// Download image from URL and return as base64
const downloadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImageAsBase64(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('base64'));
      });
      res.on('error', reject);
    }).on('error', reject);
  });
};

// Download image from URL and return as Blob (for Gradio)
const downloadImageAsBlob = async (url) => {
  const base64 = await downloadImageAsBase64(url);
  const buffer = Buffer.from(base64, 'base64');
  return new Blob([buffer], { type: 'image/jpeg' });
};

// Generate a mannequin image using FLUX based on user's body measurements
const generateMannequinWithFLUX = async (morphData) => {
  const { taille, poids, couleurPeau, morphologie } = morphData;

  const COULEUR_PEAU_LABELS = {
    tres_claire: 'very pale white European skin',
    claire: 'light fair skin',
    moyenne: 'medium olive Mediterranean skin',
    mate: 'warm golden-brown Moroccan skin',
    foncee: 'rich dark brown skin',
    tres_foncee: 'deep dark ebony skin',
  };

  const MORPHOLOGIE_DESCRIPTIONS = {
    sablier: 'hourglass figure with balanced bust and hips',
    triangle: 'pear-shaped body with wider hips',
    triangle_inverse: 'inverted triangle with broad shoulders',
    rectangle: 'straight athletic build',
    ronde: 'curvy full-figured body',
  };

  const skinDesc = COULEUR_PEAU_LABELS[couleurPeau] || couleurPeau;
  const morphDesc = MORPHOLOGIE_DESCRIPTIONS[morphologie] || morphologie;

  const bmi = poids / ((taille / 100) ** 2);
  let bodyBuild = 'average build';
  if (bmi < 18.5) bodyBuild = 'slim slender build';
  else if (bmi < 25) bodyBuild = 'fit proportionate build';
  else if (bmi < 30) bodyBuild = 'curvy full build';
  else bodyBuild = 'plus-size voluptuous build';

  const heightDesc = taille < 155 ? 'petite' : taille < 170 ? 'medium height' : 'tall';

  // IMPORTANT: Plain white top + beige pants so IDM-VTON can cleanly replace the garment
  const prompt = `A ${heightDesc} woman with ${skinDesc}, ${bodyBuild}, ${morphDesc}. She is wearing a plain simple white t-shirt and plain beige pants. Standing straight facing the camera with arms slightly away from body. Full body shot, clean white studio background, professional fashion photography, soft even lighting, no shadows, high quality, 8k.`;

  console.log('  FLUX prompt:', prompt.substring(0, 120) + '...');

  const FLUX_SPACES = [
    'black-forest-labs/FLUX.1-schnell',
    'Purz/FLUX.1-schnell',
    'jbilcke-hf/FLUX.1-schnell',
    'black-forest-labs/FLUX.1-dev',
  ];

  const hfToken = process.env.HF_TOKEN;
  console.log(`  HF_TOKEN present: ${!!hfToken}, starts with: ${hfToken ? hfToken.substring(0, 8) + '...' : 'N/A'}`);
  let lastError = null;

  for (const spaceName of FLUX_SPACES) {
    try {
      console.log(`  Trying FLUX space: ${spaceName}`);
      const connectOptions = hfToken ? { hf_token: hfToken } : {};
      const app = await Client.connect(spaceName, connectOptions);

      const result = await app.predict('/infer', {
        prompt,
        seed: 0,
        randomize_seed: true,
        width: 768,
        height: 1024,
        num_inference_steps: 4,
      });

      if (result?.data?.[0]?.url) {
        console.log('  Mannequin generated with FLUX');
        const base64 = await downloadImageAsBase64(result.data[0].url);
        return base64;
      }

      lastError = new Error('No image in FLUX response');
    } catch (error) {
      console.error(`  ${spaceName} failed:`, error.message?.substring(0, 200));
      lastError = error;
    }
  }

  if (lastError?.message?.includes('exceeded your GPU quota')) {
    const err = new Error('QUOTA_EXCEEDED');
    err.isQuota = true;
    throw err;
  }

  throw lastError || new Error('FLUX generation failed');
};

// Apply the REAL dress image on the mannequin using IDM-VTON
const applyDressWithVTON = async (personBase64, dressImageUrl) => {
  const VTON_SPACES = [
    'yisol/IDM-VTON',
    'BachNgoworking/IDM-VTON',
  ];

  const dressBlob = await downloadImageAsBlob(dressImageUrl);
  const personBuffer = Buffer.from(personBase64, 'base64');
  const personBlob = new Blob([personBuffer], { type: 'image/png' });

  const hfToken = process.env.HF_TOKEN;
  let lastError = null;

  for (const spaceName of VTON_SPACES) {
    try {
      console.log(`  Trying VTON space: ${spaceName}`);
      const connectOptions = hfToken ? { hf_token: hfToken } : {};
      const app = await Client.connect(spaceName, connectOptions);

      const result = await app.predict('/tryon', {
        dict: {
          background: personBlob,
          layers: [],
          composite: null,
        },
        garm_img: dressBlob,
        garment_des: 'Traditional Moroccan dress, caftan, takchita, elegant formal wear, exact garment transfer',
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
      });

      if (result?.data?.[0]?.url) {
        console.log('  VTON applied dress successfully!');
        const finalBase64 = await downloadImageAsBase64(result.data[0].url);
        return finalBase64;
      }

      lastError = new Error('No image in VTON response');
    } catch (error) {
      console.error(`  ${spaceName} failed:`, error.message?.substring(0, 200));
      lastError = error;

      if (error.message?.includes('exceeded your GPU quota') ||
          error.message?.includes('Queue is full')) {
        const err = new Error('QUOTA_EXCEEDED');
        err.isQuota = true;
        throw err;
      }
    }
  }

  throw lastError || new Error('VTON application failed');
};

// Main pipeline: 2 steps
// Step 1: Generate mannequin with FLUX (plain clothes)
// Step 2: Apply the REAL dress with IDM-VTON
const generateTryOnImage = async (tenue, morphData) => {
  const dressImageUrl = tenue.images?.[0]?.url;
  if (!dressImageUrl) {
    throw new Error("Cette tenue n'a pas d'image");
  }

  // Step 1: Generate a mannequin matching user's body type
  console.log('Step 1: Generating mannequin with FLUX...');
  const mannequinBase64 = await generateMannequinWithFLUX(morphData);

  // Step 2: Apply the REAL dress image on the mannequin
  console.log('Step 2: Applying real dress with IDM-VTON...');
  const finalImageBase64 = await applyDressWithVTON(mannequinBase64, dressImageUrl);

  console.log('Pipeline complete!');
  return {
    imageBase64: finalImageBase64,
    mimeType: 'image/png',
    prompt: 'FLUX mannequin + IDM-VTON real dress overlay',
  };
};

module.exports = { generateTryOnImage };
