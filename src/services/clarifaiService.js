// Clarifai-specific detection provider for clothing articles.
// Consumed by imageProcessingService.js. Swap this file for a new provider as needed.
import { CLARIFAI_API_KEY, CLARIFAI_USER_ID, CLARIFAI_APP_ID, CLARIFAI_MODEL_ID, CLARIFAI_MODEL_VERSION_ID } from '@env';
import { CLOTHING_CONCEPTS } from './constants';
import * as FileSystem from 'expo-file-system';
import { mapClarifaiLabelToCategory } from './clarifaiCategoryMapper';

// Main Clarifai clothing detection service
// imageUri: local or remote URI to the image
// Returns: Array of { id, name, confidence, boundingBox } objects
export async function separateClothingItemsWithClarifai(imageUri) {
  // Clarifai expects base64 or publicly accessible URLs. For local images, you may need to upload to a temp server or use base64.
  // Here, we'll assume imageUri is a remote URL or already accessible to Clarifai.

  const CLARIFAI_API_URL = `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/versions/${CLARIFAI_MODEL_VERSION_ID}/outputs`;

  try {
    console.log('[clarifaiService] Loaded API key starts with:', CLARIFAI_API_KEY?.slice(0, 5));
    // Prepare image data for Clarifai (base64 for local files, url for remote)
    let imageData = {};
    if (imageUri.startsWith('file://')) {
      console.log('[clarifaiService] Reading local image as base64');
      const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      console.log('[clarifaiService] Base64 string length:', base64.length, 'First 30 chars:', base64.slice(0, 30));
      imageData.base64 = base64;
    } else {
      imageData.url = imageUri;
    }
    console.log('[clarifaiService] Sending image to Clarifai:', imageData.url ? imageData.url : '[base64 image]');
    const response = await fetch(CLARIFAI_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Key ${CLARIFAI_API_KEY}`,
      },
      body: JSON.stringify({
        user_app_id: {
          user_id: CLARIFAI_USER_ID,
          app_id: CLARIFAI_APP_ID,
        },
        inputs: [
          {
            data: {
              image: imageData,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('[clarifaiService] Clarifai error response:', errorText);
      } catch (e) {
        // ignore
      }
      throw new Error(`Clarifai API error: ${response.status}`);
    }
    const data = await response.json();
    console.log('[clarifaiService] Raw Clarifai API response:', JSON.stringify(data, null, 2));
    // Extract clothing items from Clarifai regions (with bounding boxes)
    const regions = data.outputs[0]?.data?.regions || [];
    // Clothing-related concept names to include (expand as needed)
    const detectedClothing = [];
    regions.forEach((region, regionIdx) => {
      if (region.data && Array.isArray(region.data.concepts)) {
        region.data.concepts.forEach((concept, conceptIdx) => {
          // Only include relevant clothing concepts (adjust threshold as needed)
          if (CLOTHING_CONCEPTS.includes(concept.name) && concept.value > 0.3) {
            detectedClothing.push({
              id: `${concept.id}_${regionIdx}_${concept.name}`,
              name: concept.name,
              confidence: concept.value,
              boundingBox: region.region_info?.bounding_box || null,
              imageUri, // Attach the original image URI for downstream use
              category: mapClarifaiLabelToCategory(concept.name), // Standardized app category
            });
          }
        });
      }
    });
    console.log('[clarifaiService] Detected clothing:', detectedClothing);
    return detectedClothing;
  } catch (error) {
    console.error('[clarifaiService] Error calling Clarifai:', error);
    throw error;
  }
}
