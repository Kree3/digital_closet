// verificationService.js
// Service for handling verification flow business logic
// Follows Clean Architecture: screens call these functions for all verification operations

import * as ImageManipulator from 'expo-image-manipulator';
import { detectClothingArticles, cropArticlesFromImage } from './imageProcessingService';
import { processGarmentImage } from './garmentVisionService';
import { mapClarifaiLabelToCategory } from './clarifaiCategoryMapper';
import uuid from './uuid';
import { IMAGE_PROCESSING_PROVIDER } from '../config/imageProvider';

/**
 * Process an image to detect clothing articles
 * @param {string} imageUri - URI of the image to process
 * @param {Object} options - Processing options
 * @param {string} [options.openaiApiKey] - OpenAI API key for GarmentVision
 * @returns {Promise<{articles: Array, error: string|null}>} Detected articles and any error
 */
export async function processImageForVerification(imageUri, options = {}) {
  if (!imageUri) return { articles: [], error: 'No image provided' };
  
  try {
    if (IMAGE_PROCESSING_PROVIDER === 'garmentVision') {
      return await processWithGarmentVision(imageUri, options);
    } else {
      return await processWithClarifai(imageUri);
    }
  } catch (err) {
    console.error('[verificationService] processImageForVerification error:', err);
    return { 
      articles: [], 
      error: 'Failed to process image (detection or conversion error). Please try again.' 
    };
  }
}

/**
 * Process image with GarmentVision (OpenAI)
 * @private
 */
async function processWithGarmentVision(imageUri, options) {
  // Extract base64 image data
  const base64Result = await extractBase64FromUri(imageUri);
  
  if (base64Result.error) {
    return { articles: [], error: base64Result.error };
  }
  
  try {
    const result = await processGarmentImage(base64Result.base64Image, { 
      openaiApiKey: options.openaiApiKey 
    });
    
    // Assign UUIDs and return processed articles
    const articles = (Array.isArray(result) ? result : [result]).map(article => ({
      ...article,
      id: uuid(),
    }));
    
    return { articles, error: null };
  } catch (err) {
    console.error('[verificationService] GarmentVision processing error:', err);
    return { 
      articles: [], 
      error: 'Failed to process image with GarmentVision. Please try again.' 
    };
  }
}

/**
 * Process image with Clarifai
 * @private
 */
async function processWithClarifai(imageUri) {
  try {
    const articles = await detectClothingArticles(imageUri);
    return { articles, error: null };
  } catch (err) {
    console.error('[verificationService] Clarifai processing error:', err);
    return { 
      articles: [], 
      error: 'Failed to detect clothing with Clarifai. Please try again.' 
    };
  }
}

/**
 * Extract base64 data from image URI
 * @private
 */
async function extractBase64FromUri(imageUri) {
  let base64Image = null;
  
  if (imageUri.startsWith('data:')) {
    base64Image = imageUri.split(',')[1];
    return { base64Image, error: null };
  } 
  
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 512, height: 512 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    base64Image = manipResult.base64;
    return { base64Image, error: null };
  } catch (manipErr) {
    console.warn('[verificationService] Image manipulation failed:', manipErr);
    
    // Try extracting base64 from original URI if possible
    if (imageUri.startsWith('data:')) {
      base64Image = imageUri.split(',')[1];
      return { base64Image, error: null };
    }
    
    return { 
      base64Image: null, 
      error: 'Could not extract base64 image data (required for GarmentVision pipeline).' 
    };
  }
}

/**
 * Process selected articles for final confirmation
 * @param {string} imageUri - Original image URI
 * @param {Array} articles - All detected articles
 * @param {Array} selectedIds - IDs of selected articles
 * @returns {Promise<{finalArticles: Array, error: string|null}>} Processed articles and any error
 */
export async function processSelectedArticles(imageUri, articles, selectedIds) {
  if (!selectedIds.length) {
    return { finalArticles: [], error: 'No articles selected' };
  }
  
  const confirmedArticles = articles.filter(a => selectedIds.includes(a.id));
  
  try {
    if (IMAGE_PROCESSING_PROVIDER === 'garmentVision') {
      // For GarmentVision, just map categories
      const finalArticles = confirmedArticles.map(article => ({
        ...article,
        category: mapClarifaiLabelToCategory(article.category)
      }));
      
      return { finalArticles, error: null };
    } else {
      // For Clarifai, crop articles from image
      const croppedArticles = await cropArticlesFromImage(imageUri, confirmedArticles);
      
      // Ensure each article has a valid category and UUID
      const finalArticles = croppedArticles.map(article => ({
        ...article,
        id: uuid(),
        category: mapClarifaiLabelToCategory(article.name)
      }));
      
      return { finalArticles, error: null };
    }
  } catch (err) {
    console.error('[verificationService] processSelectedArticles error:', err);
    return { finalArticles: [], error: 'Failed to crop or process images.' };
  }
}
