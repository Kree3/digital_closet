// garmentVisionService.js
console.log('[garmentVisionService] TOP OF FILE loaded');
// Service module for the GarmentVision pipeline: OpenAI-powered garment segmentation and retouching
// Clean, modular, and testable. All business logic for image analysis and background cleanup lives here.
//
// Usage: import and call processGarmentImage(base64Image) from your UI or workflow service.
//
// NOTE: You must provide your OpenAI API key via environment/config.

/**
 * Utility: Convert a base64 data URI to a Blob (for multipart/form-data)
 * @param {string} dataUri - e.g. 'data:image/png;base64,iVBORw0...'
 * @returns {Blob}
 */
export function dataUriToBlob(dataUri) {
  const byteString = atob(dataUri.split(',')[1]);
  const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Main GarmentVision processing pipeline
 *
 * @param {string} base64Image - JPEG base64 string from ImagePicker
 * @param {object} options - { openaiApiKey: string, ... }
 * @returns {Promise<{
 *   boundingBox: {x: number, y: number, w: number, h: number},
 *   maskPngB64: string, // base64 PNG
 *   retouchedUrl: string, // final studio-style PNG URL
 *   metadata: object // optional: color, type, etc.
 * }>} Processed garment data
 */
// Modular pipeline: 1) Get garment description (GPT-4o), 2) Generate image (DALL-E)
// TODO: Refine prompts for both steps for best results.
// Returns: { description, generatedImageUrl }
export async function processGarmentImage(base64Image, options) {
  console.log('[garmentVisionService] processGarmentImage called with base64Image length:', base64Image?.length, 'options:', options);
  try {
    const { openaiApiKey } = options;
    if (!openaiApiKey) throw new Error('Missing OpenAI API key');

    // Step 1: Get garment items from image (GPT-4o Vision)
    const { describeGarmentImage } = await import('./garmentDescriptionService.js');
    let clothingItems;
    try {
      clothingItems = await describeGarmentImage(base64Image, { openaiApiKey });
      console.log('[garmentVisionService] describeGarmentImage result:', clothingItems);
    } catch (err) {
      console.error('[garmentVisionService] Error in describeGarmentImage:', err);
      return { error: true, message: err.message || String(err), stage: 'describeGarmentImage' };
    }
    if (!Array.isArray(clothingItems) || clothingItems.length === 0) {
      console.warn('[garmentVisionService] No clothing items detected in the image.');
      return { error: true, message: 'No clothing items detected in the image.', stage: 'describeGarmentImage' };
    }

    // Step 2: Generate product image for each clothing item (DALL-E)
    const { generateGarmentImage } = await import('./garmentImageGenerationService.js');
    const results = [];
    for (const item of clothingItems) {
      let article = { ...item };
      try {
        console.log(`[garmentVisionService] Generating image for item ${article.id}:`, article.description);
        const generatedImageUrl = await generateGarmentImage(article.description, { openaiApiKey });
        article.imageUrl = generatedImageUrl;
        console.log(`[garmentVisionService] DALL-E image URL for item ${article.id}:`, generatedImageUrl);
      } catch (e) {
        // If DALL-E fails, set imageUrl to null and add error property
        article.imageUrl = null;
        article.error = e.message || 'Image generation failed';
        console.error(`[garmentVisionService] Error generating image for item ${article.id}:`, e);
      }
      results.push(article);
    }
    console.log('[garmentVisionService] Final pipeline result:', results);
    return results;
  } catch (err) {
    console.error('[garmentVisionService] Pipeline error:', err);
    return { error: true, message: err.message || String(err), stage: 'pipeline' };
  }

  const { describeGarmentImage } = await import('./garmentDescriptionService.js');
  const description = await describeGarmentImage(base64Image, { openaiApiKey });

  // Step 2: Generate garment image from description (DALL-E)
  // Modular service: returns a generated image URL
  const { generateGarmentImage } = await import('./garmentImageGenerationService.js');
  const generatedImageUrl = await generateGarmentImage(description, { openaiApiKey });

  // Return both description and generated image URL
  return {
    description,
    generatedImageUrl
  };
  // End of modular pipeline. Add new steps or swap modules here as needed.

}

// Add Jest tests for this service as soon as you begin integration or logic changes!
