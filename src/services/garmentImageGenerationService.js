// garmentImageGenerationService.js
// Service for garment image generation using DALL-E API.
// Exposes: generateGarmentImage(description, options)
// options: { openaiApiKey }

/**
 * Generate a garment image using DALL-E API from a text description.
 * @param {string} description - Text description of the garment
 * @param {object} options - { openaiApiKey: string }
 * @returns {Promise<string>} - URL of generated image
 */
export async function generateGarmentImage(description, options) {
  const { openaiApiKey } = options;
  if (!openaiApiKey) throw new Error('Missing OpenAI API key');

  // TODO: Refine the prompt for DALL-E image generation.
  const prompt = description; // Use the description directly for now

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    })
  });
  const json = await res.json();
  if (!json.data || !json.data[0] || !json.data[0].url) {
    console.error('[garmentImageGenerationService] Unexpected DALL-E API response:', json);
    throw new Error('DALL-E API response missing expected image URL');
  }
  return json.data[0].url;
}
