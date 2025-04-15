// Central image processing service switch
// Allows easy toggling between mock and Clarifai services
import { separateClothingItemsWithClarifai } from './clarifaiService';
import { separateClothingItemsMock } from './mockImageProcessingService';

// Change this flag to switch between services
const SERVICE_TYPE = 'clarifai'; // or 'mock'

export async function separateClothingItems(imageUri) {
  if (SERVICE_TYPE === 'clarifai') {
    console.log('[imageProcessingService] Using CLARIFAI service for imageUri:', imageUri);
    return await separateClothingItemsWithClarifai(imageUri);
  } else {
    console.log('[imageProcessingService] Using MOCK service for imageUri:', imageUri);
    return await separateClothingItemsMock(imageUri);
  }
}
