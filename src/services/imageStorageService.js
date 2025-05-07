// imageStorageService.js
// Service for downloading, storing, and managing image files locally
// Addresses the image persistence issue with expiring OpenAI DALL-E URLs

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import generateUuid from './uuid';

// Constants
const IMAGE_DIRECTORY = `${FileSystem.documentDirectory}images/`;

/**
 * Initialize the images directory if it doesn't exist
 * @returns {Promise<void>}
 */
export async function initializeImageStorage() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIRECTORY);
    if (!dirInfo.exists) {
      console.log('[imageStorageService] Creating images directory');
      await FileSystem.makeDirectoryAsync(IMAGE_DIRECTORY, { intermediates: true });
    }
  } catch (error) {
    console.error('[imageStorageService] Error initializing image storage:', error);
    throw error;
  }
}

/**
 * Download an image from a URL and save it locally
 * @param {string} imageUrl - Remote image URL
 * @param {string} [filename] - Optional filename, will generate UUID if not provided
 * @returns {Promise<string>} - Local URI of the saved image
 */
export async function downloadAndSaveImage(imageUrl, filename = null) {
  if (!imageUrl) {
    throw new Error('No image URL provided');
  }

  try {
    // Ensure the images directory exists
    await initializeImageStorage();

    // Generate a unique filename if not provided
    const imageFilename = filename || `${generateUuid()}.jpg`;
    const localUri = `${IMAGE_DIRECTORY}${imageFilename}`;

    // Check if file already exists
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      console.log(`[imageStorageService] Image already exists at ${localUri}`);
      return localUri;
    }

    // Download the image
    console.log(`[imageStorageService] Downloading image from ${imageUrl}`);
    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Failed to download image: ${downloadResult.status}`);
    }

    console.log(`[imageStorageService] Image saved to ${localUri}`);
    return localUri;
  } catch (error) {
    console.error('[imageStorageService] Error downloading and saving image:', error);
    throw error;
  }
}

/**
 * Check if a local image file exists
 * @param {string} localUri - Local URI of the image
 * @returns {Promise<boolean>} - True if the image exists
 */
export async function checkImageExists(localUri) {
  if (!localUri) return false;
  
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    return fileInfo.exists;
  } catch (error) {
    console.error('[imageStorageService] Error checking if image exists:', error);
    return false;
  }
}

/**
 * Delete a local image file
 * @param {string} localUri - Local URI of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export async function deleteLocalImage(localUri) {
  if (!localUri) return false;
  
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri);
      console.log(`[imageStorageService] Deleted image at ${localUri}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[imageStorageService] Error deleting image:', error);
    return false;
  }
}

/**
 * Migrate an article by downloading its remote image if needed
 * @param {Object} article - Article object
 * @returns {Promise<Object>} - Updated article with localImageUri
 */
export async function migrateArticleImage(article) {
  // Skip if article already has a local image
  if (article.localImageUri && await checkImageExists(article.localImageUri)) {
    return article;
  }
  
  // If article has imageUrl but no localImageUri, download it
  if (article.imageUrl && !article.localImageUri) {
    try {
      const localUri = await downloadAndSaveImage(article.imageUrl);
      return { ...article, localImageUri: localUri };
    } catch (error) {
      console.error(`[imageStorageService] Failed to migrate image for article ${article.id}:`, error);
      // Return original article if migration fails
      return article;
    }
  }
  
  // Return original article if no migration needed
  return article;
}

/**
 * Migrate all articles in an array by downloading remote images
 * @param {Array} articles - Array of article objects
 * @returns {Promise<Array>} - Updated array of articles with localImageUri
 */
export async function migrateAllArticleImages(articles) {
  if (!articles || !Array.isArray(articles)) return [];
  
  console.log(`[imageStorageService] Migrating images for ${articles.length} articles`);
  
  const migratedArticles = [];
  for (const article of articles) {
    const migratedArticle = await migrateArticleImage(article);
    migratedArticles.push(migratedArticle);
  }
  
  return migratedArticles;
}
