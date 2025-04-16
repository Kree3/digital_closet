// imageProcessingService.js
// Central abstraction for clothing article detection.
// Switch providers (Clarifai, mock, or OpenAI 4o) by changing DETECTION_PROVIDER below.
// All UI should call only detectClothingArticles(imageUri) for detection.
import { separateClothingItemsWithClarifai } from './clarifaiService';
import { separateClothingItemsMock } from './mockImageProcessingService';
import { separateClothingItemsWithOpenAI } from './openaiVisionService';

// Set this flag to switch providers: 'clarifai', 'mock', 'openai'
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
    if (__DEV__) console.error('[imageProcessingService] Using CLARIFAI service for imageUri:', imageUri);
    return await separateClothingItemsWithClarifai(imageUri);
  } else if (DETECTION_PROVIDER === 'openai') {
    if (__DEV__) console.error('[imageProcessingService] Using OPENAI service for imageUri:', imageUri);
    return await separateClothingItemsWithOpenAI(imageUri);
  } else if (DETECTION_PROVIDER === 'mock') {
    if (__DEV__) console.error('[imageProcessingService] Using MOCK service for imageUri:', imageUri);
    return await separateClothingItemsMock(imageUri);
  } else {
    if (__DEV__) console.error('Unknown DETECTION_PROVIDER: ' + DETECTION_PROVIDER);
    throw new Error('Unknown DETECTION_PROVIDER: ' + DETECTION_PROVIDER);
  }
}
