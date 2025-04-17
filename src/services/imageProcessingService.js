// imageProcessingService.js
// Central abstraction for clothing article detection.
// Switch providers (Clarifai, mock, or OpenAI 4o) by changing DETECTION_PROVIDER below.
// All UI should call only detectClothingArticles(imageUri) for detection.
import { separateClothingItemsWithClarifai } from './clarifaiService';

import { separateClothingItemsWithOpenAI } from './openaiVisionService';
import { Image } from 'react-native';

// Set this flag to switch providers: 'clarifai', 'mock', 'openai'.
// To change detection provider, update DETECTION_PROVIDER below.
const DETECTION_PROVIDER = 'clarifai';

/**
 * Main detection API for the app.
 * Returns an array of { id, name, confidence, boundingBox, imageUri, croppedImageUri }
 * regardless of provider.
 *
 * To switch providers, change DETECTION_PROVIDER above.
 * To add a new provider (e.g., OpenAI 4o), add a new branch below.
 */
export async function detectClothingArticles(imageUri) {
  if (DETECTION_PROVIDER === 'clarifai') {
    if (__DEV__) console.info('[imageProcessingService] Using CLARIFAI service for imageUri:', imageUri);
    return await separateClothingItemsWithClarifai(imageUri);
  } else if (DETECTION_PROVIDER === 'openai') {
    if (__DEV__) console.info('[imageProcessingService] Using OPENAI service for imageUri:', imageUri);
    return await separateClothingItemsWithOpenAI(imageUri);

  } else {
    if (__DEV__) console.error('Unknown DETECTION_PROVIDER: ' + DETECTION_PROVIDER);
    throw new Error('Unknown DETECTION_PROVIDER: ' + DETECTION_PROVIDER);
  }
}

export async function cropArticlesFromImage(imageUri, articles) {
  console.log('[cropArticlesFromImage] ENTRY', { imageUri, numArticles: articles.length });
  if (!imageUri || !Array.isArray(articles)) {
    console.error('[cropArticlesFromImage] Invalid input', { imageUri, articles });
    throw new Error('Invalid input to cropArticlesFromImage');
  }
  // Dynamically import expo-image-manipulator for cropping
  let manipulateAsync;
  try {
    ({ manipulateAsync } = await import('expo-image-manipulator'));
  } catch (e) {
    console.error('[cropArticlesFromImage] Failed to import expo-image-manipulator', e);
    throw new Error('Failed to load image manipulation library');
  }
  // Helper to get image size
  const getImageSize = uri => new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        console.log('[cropArticlesFromImage] Got image size', { width, height });
        resolve({ width, height });
      },
      (err) => {
        console.error('[cropArticlesFromImage] Failed to get image size', err);
        reject(err);
      }
    );
  });
  let imgW, imgH;
  try {
    ({ width: imgW, height: imgH } = await getImageSize(imageUri));
  } catch (e) {
    console.error('[cropArticlesFromImage] Could not get image size for', imageUri, e);
    throw new Error('Could not get image size');
  }
  try {
    const results = await Promise.all(articles.map(async (article, idx) => {
      if (!article.boundingBox) {
        console.warn(`[cropArticlesFromImage] Article ${idx} missing boundingBox`, article);
        return article;
      }
      const { left_col, top_row, right_col, bottom_row } = article.boundingBox;
      const crop = {
        originX: Math.round(left_col * imgW),
        originY: Math.round(top_row * imgH),
        width: Math.round((right_col - left_col) * imgW),
        height: Math.round((bottom_row - top_row) * imgH),
      };
      console.log(`[cropArticlesFromImage] Cropping article ${idx}`, crop);
      if (crop.width <= 0 || crop.height <= 0) {
        console.warn(`[cropArticlesFromImage] Invalid crop dimensions for article ${idx}`, crop);
        return article;
      }
      try {
        const result = await manipulateAsync(
          imageUri,
          [{ crop }],
          { compress: 1, format: 'jpeg' }
        );
        console.log(`[cropArticlesFromImage] Cropped article ${idx} result`, result);
        return { ...article, croppedImageUri: result.uri };
      } catch (e) {
        console.error(`[cropArticlesFromImage] Failed to crop article ${idx}`, e);
        return article;
      }
    }));
    return results;
  } catch (e) {
    console.error('[cropArticlesFromImage] Unexpected error during cropping', e);
    throw new Error('Failed to crop articles');
  }
}
