// galleryService.js
// Service for managing closet/gallery articles (CRUD, persistence)
// Follows Clean Architecture: all AsyncStorage/data logic is here
// Updated May 2025: Added wearCount tracking functionality

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GALLERY_ARTICLES_KEY } from './constants';
import { migrateAllArticleImages, migrateArticleImage } from './imageStorageService';

/**
 * Get all articles from the closet/gallery.
 * @param {Object} options - Options for retrieving articles
 * @param {boolean} [options.migrateImages=false] - If true, migrate remote images to local storage
 * @returns {Promise<Array>} Array of articles (empty if none)
 */
export async function getAllArticles(options = { migrateImages: true }) {
  // Debug: Log raw AsyncStorage value
  try {
    const stored = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
    const articles = stored ? JSON.parse(stored) : [];
    
    // Optionally migrate images for articles with only imageUrl
    if (options.migrateImages && articles.length > 0) {
      console.log('[galleryService] Migrating images for existing articles');
      const migratedArticles = await migrateAllArticleImages(articles);
      
      // Save the migrated articles back to storage if any were updated
      const needsSaving = migratedArticles.some((article, index) => 
        article.localImageUri !== articles[index].localImageUri
      );
      
      if (needsSaving) {
        await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(migratedArticles));
        console.log('[galleryService] Saved migrated articles');
      }
      
      return migratedArticles;
    }
    
    return articles;
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
 * @param {boolean} [options.migrateImages=true] - If true, download and store remote images locally
 * @returns {Promise<Array>} Combined array of all articles
 */
export async function addArticles(newArticles, options = { validateImageFields: true, migrateImages: true }) {
  try {
    const existing = await getAllArticles();
    const existingIds = new Set(existing.map(a => a.id));
    
    // Filter out articles with duplicate IDs
    let filteredNew = newArticles.filter(a => !existingIds.has(a.id));
    
    // Ensure all new articles have wearCount initialized to 0
    filteredNew = filteredNew.map(article => ({
      ...article,
      wearCount: article.wearCount || 0
    }));
    
    // Validate image fields if option is enabled
    if (options.validateImageFields) {
      filteredNew = filteredNew.filter(article => {
        const hasImageField = article.croppedImageUri || article.imageUri || article.imageUrl || article.localImageUri;
        if (!hasImageField) {
          console.warn(`[galleryService] Skipping article with ID ${article.id} due to missing image fields`);
        }
        return hasImageField;
      });
    }
    
    // Migrate images for articles with only remote URLs
    if (options.migrateImages && filteredNew.length > 0) {
      console.log(`[galleryService] Migrating images for ${filteredNew.length} new articles`);
      const articlesToMigrate = filteredNew.filter(article => 
        article.imageUrl && !article.localImageUri
      );
      
      if (articlesToMigrate.length > 0) {
        console.log(`[galleryService] Found ${articlesToMigrate.length} articles needing image migration`);
        const migratedArticles = [];
        
        for (const article of filteredNew) {
          if (article.imageUrl && !article.localImageUri) {
            const migratedArticle = await migrateArticleImage(article);
            migratedArticles.push(migratedArticle);
          } else {
            migratedArticles.push(article);
          }
        }
        
        filteredNew = migratedArticles;
      }
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
export async function deleteArticlesById(ids) {
  try {
    const articles = await getAllArticles();
    const filtered = articles.filter(a => !ids.includes(a.id));
    await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('[galleryService] deleteArticlesById error:', e);
    throw e;
  }
}

/**
 * Increment the wearCount for specific articles by their IDs
 * @param {Array<string>} articleIds - Array of article IDs to increment wear count for
 * @returns {Promise<Array>} Updated array of all articles
 */
export async function incrementWearCount(articleIds) {
  try {
    if (!articleIds || !articleIds.length) {
      console.warn('[galleryService] No article IDs provided to incrementWearCount');
      return await getAllArticles();
    }
    
    console.log(`[galleryService] Incrementing wearCount for ${articleIds.length} articles`);
    const articles = await getAllArticles();
    const idSet = new Set(articleIds);
    
    // Create a new array with updated wearCount values
    const updated = articles.map(article => {
      if (idSet.has(article.id)) {
        // Increment wearCount, ensuring it exists and is a number
        const currentCount = typeof article.wearCount === 'number' ? article.wearCount : 0;
        return {
          ...article,
          wearCount: currentCount + 1
        };
      }
      return article;
    });
    
    await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('[galleryService] incrementWearCount error:', e);
    throw e;
  }
}

/**
 * Migrate existing articles to ensure they have wearCount field
 * @returns {Promise<{success: boolean, migratedCount: number, totalCount: number}>}
 */
export async function migrateArticlesWearCount() {
  try {
    console.log('[galleryService] Starting wearCount migration');
    
    // Get all articles without triggering other migrations
    const articles = await getAllArticles({ migrateImages: false });
    
    if (!articles || articles.length === 0) {
      console.log('[galleryService] No articles found to migrate wearCount');
      return { success: true, migratedCount: 0, totalCount: 0 };
    }
    
    // Count articles needing migration (those without wearCount)
    const needsMigration = articles.filter(article => 
      typeof article.wearCount !== 'number'
    );
    
    console.log(`[galleryService] Found ${needsMigration.length} of ${articles.length} articles needing wearCount migration`);
    
    if (needsMigration.length === 0) {
      return { success: true, migratedCount: 0, totalCount: articles.length };
    }
    
    // Update all articles to ensure they have wearCount
    const migratedArticles = articles.map(article => ({
      ...article,
      wearCount: typeof article.wearCount === 'number' ? article.wearCount : 0
    }));
    
    // Save the migrated articles back to storage
    await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(migratedArticles));
    
    console.log(`[galleryService] Successfully migrated wearCount for ${needsMigration.length} articles`);
    
    return { 
      success: true, 
      migratedCount: needsMigration.length, 
      totalCount: articles.length 
    };
  } catch (error) {
    console.error('[galleryService] Error during wearCount migration:', error);
    return { 
      success: false, 
      error: error.message || String(error),
      migratedCount: 0, 
      totalCount: 0 
    };
  }
}

/**
 * Clear all articles from the closet (dev utility).
 * @returns {Promise<void>}
 */
export async function clearAllArticles() {
  try {
    await AsyncStorage.removeItem(GALLERY_ARTICLES_KEY);
  } catch (e) {
    console.error('[galleryService] clearAllArticles error:', e);
    throw e;
  }
}
