// garmentVisionService.js
// Service module for the GarmentVision pipeline: OpenAI-powered garment segmentation and retouching
// Clean, modular, and testable. All business logic for image analysis and background cleanup lives here.
//
// Usage: import and call processGarmentImage(base64Image) from your UI or workflow service.
//
// NOTE: You must provide your OpenAI API key via environment/config.

import { downloadAndSaveImage } from './imageStorageService';
import { describeGarmentImage } from './garmentDescriptionService';
import { generateGarmentImage } from './garmentImageGenerationService';

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
 * Validates the processing options
 * @param {object} options - Processing options
 * @returns {string} openaiApiKey - Validated API key
 * @throws {Error} If API key is missing
 */
function validateProcessingOptions(options) {
  const { openaiApiKey } = options;
  if (!openaiApiKey) throw new Error('Missing OpenAI API key');
  return openaiApiKey;
}

/**
 * Gets clothing items from image using GPT-4o Vision
 * @param {string} base64Image - JPEG base64 string from ImagePicker
 * @param {string} openaiApiKey - OpenAI API key
 * @returns {Promise<Array>} Array of clothing items
 */
async function getClothingItemsFromImage(base64Image, openaiApiKey) {
  try {
    const clothingItems = await describeGarmentImage(base64Image, { openaiApiKey });
    console.log('[garmentVisionService] describeGarmentImage result:', clothingItems);
    
    if (!Array.isArray(clothingItems) || clothingItems.length === 0) {
      console.warn('[garmentVisionService] No clothing items detected in the image.');
      return { error: true, message: 'No clothing items detected in the image.', stage: 'describeGarmentImage' };
    }
    
    return clothingItems;
  } catch (err) {
    console.error('[garmentVisionService] Error in describeGarmentImage:', err);
    return { error: true, message: err.message || String(err), stage: 'describeGarmentImage' };
  }
}

/**
 * Processes a single clothing item: generates image and saves locally
 * @param {object} item - Clothing item to process
 * @param {string} openaiApiKey - OpenAI API key
 * @returns {Promise<object>} Processed article with image URLs
 */
async function processClothingItem(item, openaiApiKey) {
  let article = { ...item };
  
  try {
    console.log(`[garmentVisionService] Generating image for item ${article.id}:`, article.description);
    const generatedImageUrl = await generateGarmentImage(article.description, { openaiApiKey });
    article.imageUrl = generatedImageUrl;
    console.log(`[garmentVisionService] DALL-E image URL for item ${article.id}:`, generatedImageUrl);
    
    // Download and save the image locally for persistence
    try {
      const localImageUri = await downloadAndSaveImage(generatedImageUrl);
      article.localImageUri = localImageUri;
      console.log(`[garmentVisionService] Saved local image for item ${article.id}:`, localImageUri);
    } catch (downloadError) {
      console.error(`[garmentVisionService] Error saving local image for item ${article.id}:`, downloadError);
      // We still have the imageUrl, so we can continue even if local storage fails
    }
  } catch (e) {
    // If DALL-E fails, set imageUrl to null and add error property
    article.imageUrl = null;
    article.error = e.message || 'Image generation failed';
    console.error(`[garmentVisionService] Error generating image for item ${article.id}:`, e);
  }
  
  return article;
}

/**
 * Process multiple clothing items through the image generation pipeline
 * @param {Array} clothingItems - Array of clothing items to process
 * @param {string} openaiApiKey - OpenAI API key
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} Array of processed articles
 */
async function processClothingItemsBatch(clothingItems, openaiApiKey, options = {}) {
  const { parallel = false } = options;
  
  if (parallel) {
    // Process all items in parallel for better performance
    const promises = clothingItems.map(item => processClothingItem(item, openaiApiKey));
    return await Promise.all(promises);
  } else {
    // Process items sequentially (original behavior)
    const results = [];
    for (const item of clothingItems) {
      const processedArticle = await processClothingItem(item, openaiApiKey);
      results.push(processedArticle);
    }
    return results;
  }
}

/**
 * Finalize and format pipeline results with consistent logging
 * @param {Array} results - Processed clothing items
 * @returns {Array} Formatted results
 */
function finalizePipelineResults(results) {
  console.log('[garmentVisionService] Final pipeline result:', results);
  return results;
}

/**
 * Run the complete GarmentVision pipeline orchestration
 * @param {string} base64Image - JPEG base64 string from ImagePicker
 * @param {string} openaiApiKey - Validated OpenAI API key
 * @param {Object} options - Processing options
 * @returns {Promise<Array|Object>} Processed articles or error object
 */
async function runGarmentVisionPipeline(base64Image, openaiApiKey, options = {}) {
  // Step 1: Get garment items from image (GPT-4o Vision)
  const clothingItems = await getClothingItemsFromImage(base64Image, openaiApiKey);
  
  // Check if error occurred during garment detection
  if (clothingItems.error) {
    return clothingItems;
  }

  // Step 2: Process all clothing items through image generation
  const results = await processClothingItemsBatch(clothingItems, openaiApiKey, options);
  
  return finalizePipelineResults(results);
}

/**
 * Main GarmentVision processing pipeline
 *
 * @param {string} base64Image - JPEG base64 string from ImagePicker
 * @param {object} options - { openaiApiKey: string, parallel?: boolean, ... }
 * @returns {Promise<{
 *   boundingBox: {x: number, y: number, w: number, h: number},
 *   maskPngB64: string, // base64 PNG
 *   retouchedUrl: string, // final studio-style PNG URL
 *   metadata: object // optional: color, type, etc.
 * }>} Processed garment data
 */
// Modular pipeline: 1) Get garment description (GPT-4o), 2) Generate image (DALL-E)

// Returns: { description, generatedImageUrl }
export async function processGarmentImage(base64Image, options) {
  console.log('[garmentVisionService] processGarmentImage called with base64Image length:', base64Image?.length, 'options:', options);
  
  try {
    // Validate processing options
    const openaiApiKey = validateProcessingOptions(options);
    
    // Run the complete pipeline
    return await runGarmentVisionPipeline(base64Image, openaiApiKey, options);
  } catch (err) {
    console.error('[garmentVisionService] Pipeline error:', err);
    return { error: true, message: err.message || String(err), stage: 'pipeline' };
  }
}
