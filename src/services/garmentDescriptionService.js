// garmentDescriptionService.js
// Service for garment image description using GPT-4o Vision API.
// Exposes: describeGarmentImage(base64Image, options)
// options: { openaiApiKey }

/**
 * Describe a garment image using GPT-4o vision API.
 * @param {string} base64Image - JPEG base64 string
 * @param {object} options - { openaiApiKey: string }
 * @returns {Promise<string>} - Garment description
 */
export async function describeGarmentImage(base64Image, options) {
  const { openaiApiKey } = options;
  if (!openaiApiKey) throw new Error('Missing OpenAI API key');

  // Stricter system prompt
  const systemPrompt = `You are a highly accurate, concise fashion analyst. When given an image, identify up to four distinct articles of clothing and output them as a compact JSON array called clothingItems.\n\nFor each item, include:\n  • id: integer (1–4)\n  • description: ≤6-word phrase (e.g., \"women’s slim-fit navy blazer\")\n  • category: one of [jacket, shirt, pants, skirt, dress, shoes, accessory]\n  • color: primary color name\n\nOutput ONLY a valid JSON array named clothingItems. Do not include any explanation, prose, or text outside the JSON. If you cannot identify any clothing, return an empty array: [].`;

  // Stricter user prompt
  const userPrompt = `Please analyze and return ONLY the JSON array clothingItems as specified. Absolutely no explanation or prose.`;

  // Compose messages array for OpenAI API
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
        { type: 'text', text: userPrompt }
      ]
    }
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages
    })
  });
  const json = await res.json();
  // For debugging only; remove or wrap in debug flag for production
  // console.log('[garmentDescriptionService] Full OpenAI API response:', JSON.stringify(json));
  if (!json.choices || !json.choices[0] || !json.choices[0].message || typeof json.choices[0].message.content !== 'string') {
    console.error('[garmentDescriptionService] Unexpected API response structure:', json);
    return [];
  }
  let contentStr = json.choices[0].message.content.trim();
  // For debugging only; remove or wrap in debug flag for production
  // console.log('[garmentDescriptionService] Raw model content:', contentStr);
  // Strip Markdown code fences if present
  if (contentStr.startsWith('```')) {
    // Remove the opening and closing code fences
    contentStr = contentStr.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '').trim();
  }
  // Try to parse the JSON array from the model output
  let clothingItems;
  try {
    if (contentStr.startsWith('{')) {
      const parsed = JSON.parse(contentStr);
      clothingItems = parsed.clothingItems;
    } else if (contentStr.startsWith('[')) {
      clothingItems = JSON.parse(contentStr);
    } else {
      throw new Error('Response does not start with { or [');
    }
    if (!Array.isArray(clothingItems)) throw new Error('clothingItems is not an array');
  } catch (err) {
    console.error('[garmentDescriptionService] Failed to parse model JSON:', err, contentStr);
    return [];
  }
  return clothingItems;
}
