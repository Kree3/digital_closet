// openaiVisionService.js
// Provider for clothing detection using OpenAI Vision (e.g., GPT-4o).
// Returns: [{ id, name, confidence, boundingBox }].

import { OPENAI_API_KEY } from '@env';

/**
 * Detect clothing articles in an image using OpenAI Vision.
 * @param {string} imageUri - Local URI to the image file
 * @returns {Promise<Array<{ id, name, confidence, boundingBox }>>}
 */
export async function separateClothingItemsWithOpenAI(imageUri) {
  // Convert the local file to base64
  let base64Image;
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    base64Image = await blobToBase64(blob);
    if (__DEV__) console.log('[openaiVisionService] Image converted to base64, length:', base64Image.length);
  } catch (e) {
    if (__DEV__) console.error('[openaiVisionService] Failed to read image file:', e);
    throw new Error('Failed to read image file for OpenAI Vision: ' + e.message);
  }

  // Prepare OpenAI Vision API payload
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const prompt = `You are the world's foremost fashion merchandiser and image retoucher with an exceptional eye for style and detail in online retail photography. Your task is as follows:\n\n1. Given the uploaded photo of an outfit, analyze and identify each individual piece of clothing (e.g., t-shirts, jackets, skirts, pants).\n2. For each article of clothing:\n   - Precisely detect its boundaries (provide cropping coordinates as {top, left, bottom, right} percentages of the image, between 0 and 1).\n   - Describe the garment's type, color, fabric, and any other notable features.\n3. Produce a re-rendered, high-quality product image for each garment that meets the following criteria:\n   - Style: Emulate professional product images as seen on high-end online retailers like Uniqlo.\n   - Background: Replace the original background with a pure white, studio-quality backdrop.\n   - Lighting: Ensure uniform, soft, and even lighting across the entire garment.\n   - Composition: Center the clothing item without distractions or additional elements.\n   - Output: If possible, return the generated product image as a base64-encoded JPEG string. If not possible, describe how the image would look.\n\nReturn your results as a JSON array, with each item containing:\n- garment_type\n- attributes (e.g., color, fabric)\n- bounding_box (coordinates)\n- product_image (base64 string or description)`;
  if (__DEV__) console.log('[openaiVisionService] Using prompt:', prompt);
  const payload = {
    model: 'gpt-4o', // Cheapest vision model as of 2024
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'low' // Use cheapest token option
            }
          },
        ],
      },
    ],
  };

  // Call OpenAI API
  let result;
  try {
    result = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (__DEV__) console.error('[openaiVisionService] Network or fetch error:', e);
    throw new Error('OpenAI Vision API network error: ' + e.message);
  }

  if (!result.ok) {
    const errorText = await result.text();
    if (__DEV__) console.error('[openaiVisionService] OpenAI API returned error:', errorText);
    throw new Error('OpenAI Vision API error: ' + errorText);
  }

  let data;
  try {
    data = await result.json();
    if (__DEV__) console.log('[openaiVisionService] OpenAI API response:', data);
  } catch (e) {
    if (__DEV__) console.error('[openaiVisionService] Failed to parse OpenAI API JSON:', e);
    throw new Error('Failed to parse OpenAI Vision API response JSON: ' + e.message);
  }

  let articles = [];
  let rawText;
  try {
    // Try to extract the actual text output from the OpenAI Chat Completions response
    if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      const firstChoice = data.choices[0];
      if (__DEV__) console.log('[openaiVisionService] OpenAI choice[0]:', firstChoice);
      if (firstChoice.message && firstChoice.message.content) {
        rawText = firstChoice.message.content;
      }
    }
    if (!rawText) {
      throw new Error('No valid text content found in OpenAI Vision response.');
    }
    // Remove code block formatting if present
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```[a-zA-Z]*\n/, '').replace(/```$/, '').trim();
    }
    if (__DEV__) console.log('[openaiVisionService] Cleaned extracted text:', cleanedText);
    articles = JSON.parse(cleanedText);
  } catch (e) {
    if (__DEV__) console.error('[openaiVisionService] Failed to extract/parse OpenAI output:', rawText, e);
    throw new Error('Failed to parse OpenAI Vision response: ' + e.message);
  }

  // Add fallback IDs if missing
  articles = articles.map((item, idx) => ({
    id: item.id || `${item.name || 'unknown'}_${idx}`,
    ...item,
  }));

  return articles;
}

// Helper: Convert Blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
