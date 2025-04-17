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


  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-2', // DALL-E 2 used for lower cost and lower resolution. Upgrade to DALL-E 3 when smaller sizes are supported.
      prompt: description, // Pass the description string directly as the prompt
      n: 1,
      size: '512x512' // DALL-E 2 supports 256x256, 512x512, 1024x1024. Using 512x512 for mobile-friendly balance.
    })
  });
  const json = await res.json();
  if (!json.data || !json.data[0] || !json.data[0].url) {
    // Log error only in development; avoid leaking sensitive info in production
    console.error('[garmentImageGenerationService] Unexpected DALL-E API response:', json);
    throw new Error('DALL-E API response missing expected image URL');
  }
  return json.data[0].url;
}
