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

// Step 1: Build prompt for person generation (plain white outfit for virtual try-on)
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

// Step 2: Generate person image with FLUX
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

// Step 3: Download dress image from URL
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

// Step 4: Call IDM-VTON Space for virtual try-on
const virtualTryOn = async (personBuffer, garmentBuffer, hfToken) => {
  const spaceUrl = 'https://yisol-idm-vton.hf.space';

  // Upload person image
  const personFile = await uploadToSpace(spaceUrl, personBuffer, 'person.jpg', hfToken);
  // Upload garment image
  const garmentFile = await uploadToSpace(spaceUrl, garmentBuffer, 'garment.jpg', hfToken);

  // Call the tryon endpoint
  const submitRes = await fetch(`${spaceUrl}/gradio_api/call/tryon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(hfToken ? { Authorization: `Bearer ${hfToken}` } : {}),
    },
    body: JSON.stringify({
      data: [
        { path: personFile, type: 'filepath' },
        { path: garmentFile, type: 'filepath' },
        'Best quality, high resolution',
        true,  // auto-mask
        true,  // auto-crop
        30,    // denoise steps
        42,    // seed
      ],
    }),
  });

  if (!submitRes.ok) {
    throw new Error(`IDM-VTON submit error: ${submitRes.status}`);
  }

  const { event_id } = await submitRes.json();

  // Poll for result via SSE
  const resultRes = await fetch(`${spaceUrl}/gradio_api/call/tryon/${event_id}`, {
    headers: hfToken ? { Authorization: `Bearer ${hfToken}` } : {},
  });

  const text = await resultRes.text();
  // Parse SSE: find the last "data:" line with the result
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('data:')) {
      try {
        const data = JSON.parse(line.slice(5).trim());
        if (Array.isArray(data) && data[0]?.url) {
          // Download the result image
          const resultBuffer = await downloadImage(data[0].url);
          return resultBuffer;
        }
      } catch { /* continue parsing */ }
    }
  }

  throw new Error('No result image from IDM-VTON');
};

// Upload file to Gradio space
const uploadToSpace = async (spaceUrl, buffer, filename, hfToken) => {
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="files"; filename="${filename}"\r\n`,
    'Content-Type: image/jpeg\r\n\r\n',
  ];

  const header = Buffer.from(bodyParts.join(''));
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, buffer, footer]);

  const res = await fetch(`${spaceUrl}/gradio_api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      ...(hfToken ? { Authorization: `Bearer ${hfToken}` } : {}),
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Upload error: ${res.status}`);
  }

  const files = await res.json();
  return files[0];
};

// Build prompt for FLUX-only fallback (when IDM-VTON is unavailable)
const buildTryOnPrompt = (tenue, morphData) => {
  const { taille, poids, couleurPeau, morphologie } = morphData;
  const skinDesc = COULEUR_PEAU_LABELS[couleurPeau] || couleurPeau;
  const morphDesc = MORPHOLOGIE_DESCRIPTIONS[morphologie] || morphologie;

  const bmi = poids / ((taille / 100) ** 2);
  let bodyBuild = 'average';
  if (bmi < 18.5) bodyBuild = 'slim and slender';
  else if (bmi < 25) bodyBuild = 'fit and proportionate';
  else if (bmi < 30) bodyBuild = 'curvy and full';
  else bodyBuild = 'plus-size and voluptuous';

  const heightDesc = taille < 155 ? 'petite' : taille < 170 ? 'medium height' : 'tall';
  const colors = tenue.couleurs?.length > 0 ? tenue.couleurs.join(' and ') : 'rich traditional Moroccan colors';

  return `Professional fashion lookbook photo, studio lighting, clean white background. A beautiful ${heightDesc} ${bodyBuild} Moroccan woman with ${skinDesc} and ${morphDesc}, wearing ${tenue.description || 'a traditional Moroccan dress'}. Colors: ${colors}. Full body shot head to toe, standing elegantly facing camera. Ultra high quality, 8k, photorealistic, fashion editorial, sharp focus.`;
};

// Main function: 2-step virtual try-on pipeline
const generateTryOnImage = async (tenue, morphData) => {
  const HF_TOKEN = process.env.HF_API_TOKEN;
  if (!HF_TOKEN) {
    throw new Error('HF_API_TOKEN non configure dans .env');
  }

  const dressImageUrl = tenue.images?.[0]?.url;

  // Try 2-step pipeline: FLUX person + IDM-VTON try-on
  if (dressImageUrl) {
    try {
      console.log('Step 1: Generating person image with FLUX...');
      const personPrompt = buildPersonPrompt(morphData);
      const personBuffer = await generateWithFlux(personPrompt);

      console.log('Step 2: Downloading dress image...');
      const dressBuffer = await downloadImage(dressImageUrl);

      console.log('Step 3: Virtual try-on with IDM-VTON...');
      const resultBuffer = await virtualTryOn(personBuffer, dressBuffer, HF_TOKEN);

      return {
        imageBase64: resultBuffer.toString('base64'),
        mimeType: 'image/png',
        prompt: personPrompt,
      };
    } catch (err) {
      console.error('Pipeline IDM-VTON echouee, fallback FLUX:', err.message);
      // Fallback to FLUX-only
    }
  }

  // Fallback: FLUX text-to-image only
  console.log('Fallback: FLUX text-to-image...');
  const prompt = buildTryOnPrompt(tenue, morphData);
  const imageBuffer = await generateWithFlux(prompt);

  return {
    imageBase64: imageBuffer.toString('base64'),
    mimeType: 'image/jpeg',
    prompt,
  };
};

module.exports = { generateTryOnImage, buildTryOnPrompt };
