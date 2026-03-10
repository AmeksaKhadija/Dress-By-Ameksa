const { Client, handle_file } = require('@gradio/client');
const fs = require('fs');
const path = require('path');
const os = require('os');

const COULEUR_PEAU_LABELS = {
  tres_claire: 'very pale white European skin',
  claire: 'light fair skin',
  moyenne: 'medium olive Mediterranean skin',
  mate: 'warm golden-brown Moroccan skin',
  foncee: 'rich dark brown skin',
  tres_foncee: 'deep dark ebony skin',
};

const MORPHOLOGIE_DESCRIPTIONS = {
  sablier: 'hourglass figure with balanced bust and hips and a defined narrow waist',
  triangle: 'pear-shaped body with wider hips and narrower shoulders',
  triangle_inverse: 'inverted triangle with broad athletic shoulders and slim hips',
  rectangle: 'straight athletic build with similar shoulders waist and hips',
  ronde: 'curvy full-figured body with a soft rounded silhouette',
};

// IDM-VTON space
const TRYON_SPACE = 'yisol/IDM-VTON';

// Build prompt for person generation
const buildPersonPrompt = (morphData) => {
  const { taille, poids, couleurPeau, morphologie } = morphData;
  const skinDesc = COULEUR_PEAU_LABELS[couleurPeau] || couleurPeau;
  const morphDesc = MORPHOLOGIE_DESCRIPTIONS[morphologie] || morphologie;

  const bmi = poids / ((taille / 100) ** 2);
  let bodyBuild = 'average build';
  if (bmi < 18.5) bodyBuild = 'slim slender build';
  else if (bmi < 25) bodyBuild = 'fit proportionate build';
  else if (bmi < 30) bodyBuild = 'curvy full build';
  else bodyBuild = 'plus-size voluptuous build';

  const heightDesc = taille < 155 ? 'petite' : taille < 170 ? 'medium height' : 'tall';

  return `Full body photo of a beautiful ${heightDesc} woman with ${skinDesc}, ${bodyBuild}, ${morphDesc}. She is wearing a simple plain white fitted tank top and white fitted pants. Standing straight facing the camera with arms slightly at her sides. Clean white studio background. Professional fashion photography, sharp focus, well lit, 8k quality.`;
};

// Generate person image with FLUX
const generateWithFlux = async (prompt) => {
  const HF_TOKEN = process.env.HF_API_TOKEN;
  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FLUX error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

// Download image from URL (follows redirects)
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
};

// Save buffer to temp file and return path
const saveToTempFile = (buffer, filename) => {
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `tryon_${Date.now()}_${filename}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

// Clean up temp files
const cleanupFiles = (...files) => {
  for (const f of files) {
    try { fs.unlinkSync(f); } catch { /* ignore */ }
  }
};

// Call IDM-VTON via @gradio/client
const virtualTryOn = async (personBuffer, garmentBuffer, hfToken, garmentDesc) => {
  // Save buffers to temp files (gradio client needs file paths)
  const personPath = saveToTempFile(personBuffer, 'person.jpg');
  const garmentPath = saveToTempFile(garmentBuffer, 'garment.jpg');

  const errors = [];

  try {
    for (const spaceName of [TRYON_SPACE]) {
      try {
        console.log(`  Trying space: ${spaceName}`);

        const client = await Client.connect(spaceName, {
          hf_token: hfToken,
        });

        const result = await client.predict('/tryon', {
          dict: {
            background: handle_file(personPath),
            layers: [],
            composite: null,
          },
          garm_img: handle_file(garmentPath),
          garment_des: garmentDesc,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42,
        });

        console.log(`  Result received from ${spaceName}`);

        // result.data[0] is the output image (filepath or URL)
        const outputImage = result.data[0];

        if (outputImage?.url) {
          // Download from URL
          console.log(`  Downloading result from: ${outputImage.url}`);
          const resultBuffer = await downloadImage(outputImage.url);
          return resultBuffer;
        } else if (outputImage?.path) {
          // Read from local path
          const resultBuffer = fs.readFileSync(outputImage.path);
          return resultBuffer;
        } else if (typeof outputImage === 'string') {
          // Could be a file path or URL
          if (outputImage.startsWith('http')) {
            const resultBuffer = await downloadImage(outputImage);
            return resultBuffer;
          } else {
            const resultBuffer = fs.readFileSync(outputImage);
            return resultBuffer;
          }
        }

        throw new Error('Unexpected result format from IDM-VTON');
      } catch (err) {
        console.error(`  Space ${spaceName} failed: ${err.message}`);
        errors.push(`${spaceName}: ${err.message}`);
      }
    }

    const allErrors = errors.join('\n');
    if (allErrors.toLowerCase().includes('quota')) {
      const err = new Error('QUOTA_EXCEEDED');
      err.isQuota = true;
      throw err;
    }
    throw new Error(`All try-on spaces failed:\n${allErrors}`);
  } finally {
    cleanupFiles(personPath, garmentPath);
  }
};

// Main function: generate person + virtual try-on with the exact dress image
const generateTryOnImage = async (tenue, morphData) => {
  const HF_TOKEN = process.env.HF_API_TOKEN;
  if (!HF_TOKEN) {
    throw new Error('HF_API_TOKEN non configure dans .env');
  }

  const dressImageUrl = tenue.images?.[0]?.url;
  if (!dressImageUrl) {
    throw new Error('Cette tenue n\'a pas d\'image');
  }

  console.log('Step 1: Generating person image with FLUX...');
  const personPrompt = buildPersonPrompt(morphData);
  const personBuffer = await generateWithFlux(personPrompt);
  console.log(`  Person image generated (${personBuffer.length} bytes)`);

  console.log('Step 2: Downloading dress image...');
  const dressBuffer = await downloadImage(dressImageUrl);
  console.log(`  Dress image downloaded (${dressBuffer.length} bytes)`);

  console.log('Step 3: Virtual try-on with IDM-VTON...');
  const garmentDesc = tenue.description || (tenue.nom ? `${tenue.nom}, traditional Moroccan dress` : 'Traditional Moroccan dress');
  const resultBuffer = await virtualTryOn(personBuffer, dressBuffer, HF_TOKEN, garmentDesc);
  console.log(`  Try-on result generated (${resultBuffer.length} bytes)`);

  return {
    imageBase64: resultBuffer.toString('base64'),
    mimeType: 'image/png',
    prompt: personPrompt,
  };
};

module.exports = { generateTryOnImage };
