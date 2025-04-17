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
    console.log('[galleryService] getAllArticles raw:', stored);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('[galleryService] getAllArticles error:', e);
    return [];
  }
}

/**
 * Add new articles (array) to the closet, filtering by unique id.
 * @param {Array} newArticles
 * @returns {Promise<Array>} Combined array of all articles
 */
export async function addArticles(newArticles) {
  try {
    const existing = await getAllArticles();
    console.log('[galleryService] Existing articles:', existing);
    const existingIds = new Set(existing.map(a => a.id));
    const filteredNew = newArticles.filter(a => !existingIds.has(a.id));
    console.log('[galleryService] Filtered new articles:', filteredNew);
    const combined = [...existing, ...filteredNew];
    await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(combined));
    // Debug: Log written value
    const verify = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
    console.log('[galleryService] addArticles wrote:', verify);
    return combined;
  } catch (e) {
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
    return [];
  }
}

/**
 * Clear all articles from the closet.
 * @returns {Promise<void>}
 */
export async function clearAllArticles() {
  await AsyncStorage.removeItem(GALLERY_ARTICLES_KEY);
  // Debug: Log value after clear
  const verify = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
  console.log('[galleryService] clearAllArticles, value after clear:', verify);
}
