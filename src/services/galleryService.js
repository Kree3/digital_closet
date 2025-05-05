// galleryService.js
// Service for managing closet/gallery articles (CRUD, persistence)
// Follows Clean Architecture: all AsyncStorage/data logic is here

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GALLERY_ARTICLES_KEY } from './constants';

/**
 * Get all articles from the closet/gallery.
 * @returns {Promise<Array>} Array of articles (empty if none)
 */
export async function getAllArticles() {
  // Debug: Log raw AsyncStorage value
  try {
    const stored = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);

    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('[galleryService] getAllArticles error:', e);
    return [];
  }
}

/**
 * Add new articles (array) to the closet, filtering by unique id and validating image fields.
 * @param {Array} newArticles
 * @param {Object} options
 * @param {boolean} [options.validateImageFields=true] - If true, only save articles with at least one image field
 * @returns {Promise<Array>} Combined array of all articles
 */
export async function addArticles(newArticles, options = { validateImageFields: true }) {
  try {
    const existing = await getAllArticles();
    const existingIds = new Set(existing.map(a => a.id));
    
    // Filter out articles with duplicate IDs
    let filteredNew = newArticles.filter(a => !existingIds.has(a.id));
    
    // Validate image fields if option is enabled
    if (options.validateImageFields) {
      filteredNew = filteredNew.filter(article => {
        const hasImageField = article.croppedImageUri || article.imageUri || article.imageUrl;
        if (!hasImageField) {
          console.warn(`[galleryService] Skipping article with ID ${article.id} due to missing image fields`);
        }
        return hasImageField;
      });
    }
    
    const combined = [...existing, ...filteredNew];
    await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(combined));
    return combined;
  } catch (e) {
    console.error('[galleryService] addArticles error:', e);
    return [];
  }
}

/**
 * Delete articles by array of ids.
 * @param {Array} idsToDelete
 * @returns {Promise<Array>} Updated array of articles
 */
export async function deleteArticlesById(idsToDelete) {
  try {
    const existing = await getAllArticles();
    const updated = existing.filter(a => !idsToDelete.includes(a.id));
    await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('[galleryService] deleteArticlesById error:', e);
    return [];
  }
}

/**
 * Clear all articles from the closet.
 * @returns {Promise<void>}
 */
export async function clearAllArticles() {
  await AsyncStorage.removeItem(GALLERY_ARTICLES_KEY);
  // Optionally verify removal in debug mode
  // const verify = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
  // console.log('[galleryService] clearAllArticles, value after clear:', verify);
}
