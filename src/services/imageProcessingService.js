// Central detection service abstraction
// Allows easy toggling between Clarifai, mock, and future providers (e.g., OpenAI 4o)
// imageProcessingService.js
// Central detection service abstraction for clothing articles.
// Switch providers (Clarifai, mock, or future OpenAI 4o) by changing DETECTION_PROVIDER below.
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
    console.log('[imageProcessingService] Using CLARIFAI service for imageUri:', imageUri);
    return await separateClothingItemsWithClarifai(imageUri);
  } else if (DETECTION_PROVIDER === 'openai') {
    console.log('[imageProcessingService] Using OPENAI service for imageUri:', imageUri);
    return await separateClothingItemsWithOpenAI(imageUri);
  } else if (DETECTION_PROVIDER === 'mock') {
    console.log('[imageProcessingService] Using MOCK service for imageUri:', imageUri);
    return await separateClothingItemsMock(imageUri);
  } else {
    throw new Error('Unknown DETECTION_PROVIDER: ' + DETECTION_PROVIDER);
  }
}
