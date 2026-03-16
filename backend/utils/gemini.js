const { GoogleGenAI } = require('@google/genai');
const { Client } = require('@gradio/client');

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

// Step 1: Use Gemini (free text model) to generate an optimized prompt
const generatePromptWithGemini = async (tenue, morphData) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('  No Gemini API key, using fallback prompt');
    return buildFallbackPrompt(tenue, morphData);
  }

  const { taille, poids, couleurPeau, morphologie } = morphData;
  const skinDesc = COULEUR_PEAU_LABELS[couleurPeau] || couleurPeau;
  const morphDesc = MORPHOLOGIE_DESCRIPTIONS[morphologie] || morphologie;

  const bmi = poids / ((taille / 100) ** 2);
  let bodyBuild = 'average build';
  if (bmi < 18.5) bodyBuild = 'slim slender build';
  else if (bmi < 25) bodyBuild = 'fit proportionate build';
  else if (bmi < 30) bodyBuild = 'curvy full build';
  else bodyBuild = 'plus-size voluptuous build';

  const heightDesc = taille < 155 ? 'petite (short)' : taille < 170 ? 'medium height' : 'tall';

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a fashion photography prompt engineer. Generate a concise, detailed prompt for an AI image generator to create a photo of a woman model.

The woman should be:
- ${heightDesc}, ${bodyBuild}
- ${skinDesc}
- ${morphDesc}
- Standing in a natural elegant pose, facing the camera
- Professional fashion photography setting

IMPORTANT: Do NOT describe any clothing or dress. The woman should be wearing a simple plain white t-shirt and plain beige pants. The virtual try-on AI will overlay the real dress later.

Output ONLY the prompt text, nothing else. Keep it under 100 words. Focus on the woman's physical appearance, pose, lighting, and background.`
        }]
      }]
    });

    const prompt = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (prompt) {
      console.log('  Gemini generated prompt:', prompt.substring(0, 150) + '...');
      return prompt;
    }
  } catch (error) {
    console.error('  Gemini prompt generation failed:', error.message);
  }

  return buildFallbackPrompt(tenue, morphData);
};

// Fallback prompt if Gemini is unavailable
const buildFallbackPrompt = (tenue, morphData) => {
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

  return `A beautiful ${heightDesc} woman with ${skinDesc}, ${bodyBuild}, ${morphDesc}. She is wearing a simple plain white t-shirt and plain beige pants. Standing elegantly facing the camera. Professional fashion photography, soft studio lighting, clean neutral background. Full body shot, high quality, 8k resolution.`;
};

// Step 2: Use FLUX on HuggingFace to generate the person image
const generatePersonImage = async (prompt) => {
  const FLUX_SPACES = [
    'black-forest-labs/FLUX.1-schnell',
    'black-forest-labs/FLUX.1-dev',
  ];

  let lastError = null;

  for (const spaceName of FLUX_SPACES) {
    try {
      console.log(`  Trying FLUX space: ${spaceName}`);
      const app = await Client.connect(spaceName);

      const result = await app.predict('/infer', {
        prompt: prompt,
        seed: 0,
        randomize_seed: true,
        width: 768,
        height: 1024,
        num_inference_steps: 4,
      });

      if (result?.data?.[0]?.url) {
        const imageUrl = result.data[0].url;
        console.log('  Person image generated with FLUX');
        const base64 = await downloadImageAsBase64(imageUrl);
        return { base64, url: imageUrl };
      }

      console.log(`  ${spaceName}: no image in response`);
      lastError = new Error('No image in FLUX response');
    } catch (error) {
      console.error(`  ${spaceName} failed:`, error.message?.substring(0, 200));
      lastError = error;

      // Continue to next space instead of throwing immediately
      if (error.message?.includes('Queue is full')) {
        continue;
      }
    }
  }

  // If all spaces failed due to quota, throw quota error
  if (lastError?.message?.includes('exceeded your GPU quota')) {
    const err = new Error('QUOTA_EXCEEDED');
    err.isQuota = true;
    throw err;
  }

  throw lastError || new Error('FLUX generation failed');
};

// Step 3: Use IDM-VTON to apply the real dress on the person
const applyDressWithVTON = async (personBase64, dressImageUrl) => {
  const VTON_SPACES = [
    'yisol/IDM-VTON',
    'BachNgoworking/IDM-VTON',
  ];

  const dressBlob = await downloadImageAsBlob(dressImageUrl);
  const personBuffer = Buffer.from(personBase64, 'base64');
  const personBlob = new Blob([personBuffer], { type: 'image/png' });

  let lastError = null;

  for (const spaceName of VTON_SPACES) {
    try {
      console.log(`  Trying VTON space: ${spaceName}`);
      const app = await Client.connect(spaceName);

      const result = await app.predict('/tryon', {
        dict: {
          background: personBlob,
          layers: [],
          composite: null,
        },
        garm_img: dressBlob,
        garment_des: 'Traditional Moroccan dress, elegant formal wear',
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

      console.log(`  ${spaceName}: no image in response`);
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

// Main function: 3-step pipeline
const generateTryOnImage = async (tenue, morphData) => {
  const dressImageUrl = tenue.images?.[0]?.url;
  if (!dressImageUrl) {
    throw new Error("Cette tenue n'a pas d'image");
  }

  // Step 1: Gemini generates an optimized prompt (free text model)
  console.log('Step 1: Generating optimized prompt with Gemini...');
  const prompt = await generatePromptWithGemini(tenue, morphData);

  // Step 2: FLUX generates a person mannequin
  console.log('Step 2: Generating person mannequin with FLUX...');
  const personImage = await generatePersonImage(prompt);

  // Step 3: IDM-VTON applies the REAL dress on the person
  console.log('Step 3: Applying real dress with IDM-VTON...');
  const finalImageBase64 = await applyDressWithVTON(personImage.base64, dressImageUrl);

  console.log('Pipeline complete!');
  return {
    imageBase64: finalImageBase64,
    mimeType: 'image/png',
    prompt,
  };
};

module.exports = { generateTryOnImage };
