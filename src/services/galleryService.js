// galleryService.js
// Service for managing closet/gallery articles (CRUD, persistence)
// Follows Clean Architecture: all AsyncStorage/data logic is here
// Updated May 2025: Added wearCount tracking functionality

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GALLERY_ARTICLES_KEY } from './constants';
import { migrateAllArticleImages, migrateArticleImage } from './imageStorageService';
import { logError, logWarning, logInfo } from './errorHandlingService';

/**
 * Get all articles from the closet/gallery.
 * @param {Object} options - Options for retrieving articles
 * @param {boolean} [options.migrateImages=false] - If true, migrate remote images to local storage
 * @returns {Promise<Array>} Array of articles (empty if none)
 */
export async function getAllArticles(options = { migrateImages: false }) {
  // Debug: Log raw AsyncStorage value
  try {
    const stored = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
    const articles = stored ? JSON.parse(stored) : [];
    
    // Optionally migrate images for articles with only imageUrl
    if (options.migrateImages && articles.length > 0) {
      logInfo('[galleryService]', 'Migrating images for existing articles');
      const migratedArticles = await migrateAllArticleImages(articles);
      
      // Save the migrated articles back to storage if any were updated
      const needsSaving = migratedArticles.some((article, index) => 
        article.localImageUri !== articles[index].localImageUri
      );
      
      if (needsSaving) {
        await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(migratedArticles));
        logInfo('[galleryService]', 'Saved migrated articles');
      }
      
      return migratedArticles;
    }
    
    return articles;
  } catch (e) {
    logError('[galleryService]', 'getAllArticles error', e);
    return [];
  }
}

/**
 * Filter out duplicate articles based on their ID
 * @param {Array} newArticles - New articles to filter
 * @param {Array} existingArticles - Existing articles to check against
 * @returns {Array} Filtered articles without duplicates
 */
function filterDuplicateArticles(newArticles, existingArticles) {
  const existingIds = new Set(existingArticles.map(a => a.id));
  return newArticles.filter(a => !existingIds.has(a.id));
}

/**
 * Ensure all articles have wearCount initialized to 0 if not present
 * @param {Array} articles - Articles to initialize
 * @returns {Array} Articles with wearCount initialized
 */
function initializeWearCount(articles) {
  return articles.map(article => ({
    ...article,
    wearCount: article.wearCount || 0
  }));
}

/**
 * Validate that articles have at least one required image field
 * @param {Array} articles - Articles to validate
 * @returns {Array} Articles that have valid image fields
 */
function validateArticleImageFields(articles) {
  return articles.filter(article => {
    const hasImageField = article.croppedImageUri || article.imageUri || article.imageUrl || article.localImageUri;
    if (!hasImageField) {
      logWarning('[galleryService]', `Skipping article with ID ${article.id} due to missing image fields`);
    }
    return hasImageField;
  });
}

/**
 * Handle image migration for articles with remote URLs
 * @param {Array} articles - Articles to potentially migrate
 * @returns {Promise<Array>} Articles with migrated images
 */
async function migrateArticleImages(articles) {
  if (articles.length === 0) {
    return articles;
  }

  logInfo('[galleryService]', `Migrating images for ${articles.length} new articles`);
  const articlesToMigrate = articles.filter(article => 
    article.imageUrl && !article.localImageUri
  );
  
  if (articlesToMigrate.length === 0) {
    return articles;
  }

  logInfo('[galleryService]', `Found ${articlesToMigrate.length} articles needing image migration`);
  const migratedArticles = [];
  
  for (const article of articles) {
    if (article.imageUrl && !article.localImageUri) {
      const migratedArticle = await migrateArticleImage(article);
      migratedArticles.push(migratedArticle);
    } else {
      migratedArticles.push(article);
    }
  }
  
  return migratedArticles;
}

/**
 * Normalize and apply default values to addArticles options
 * @param {Object} options - Raw options object
 * @returns {Object} Normalized options with defaults
 */
function normalizeAddArticlesOptions(options = {}) {
  return {
    validateImageFields: options.validateImageFields !== false, // default true
    migrateImages: options.migrateImages !== false // default true
  };
}

/**
 * Process new articles through the validation and migration pipeline
 * @param {Array} newArticles - Raw new articles to process
 * @param {Array} existingArticles - Existing articles for duplicate filtering
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} Processed articles ready for storage
 */
async function processNewArticles(newArticles, existingArticles, options) {
  // Filter out articles with duplicate IDs
  let filteredNew = filterDuplicateArticles(newArticles, existingArticles);
  
  // Ensure all new articles have wearCount initialized to 0
  filteredNew = initializeWearCount(filteredNew);
  
  // Validate image fields if option is enabled
  if (options.validateImageFields) {
    filteredNew = validateArticleImageFields(filteredNew);
  }
  
  // Migrate images for articles with only remote URLs
  if (options.migrateImages) {
    filteredNew = await migrateArticleImages(filteredNew);
  }
  
  return filteredNew;
}

/**
 * Save articles to AsyncStorage
 * @param {Array} existingArticles - Current articles in storage
 * @param {Array} newArticles - New articles to add
 * @returns {Promise<Array>} Combined array of all articles
 */
async function saveArticlesToStorage(existingArticles, newArticles) {
  const combined = [...existingArticles, ...newArticles];
  await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(combined));
  return combined;
}

/**
 * Add new articles (array) to the closet, filtering by unique id and validating image fields.
 * @param {Array} newArticles
 * @param {Object} options
 * @param {boolean} [options.validateImageFields=true] - If true, only save articles with at least one image field
 * @param {boolean} [options.migrateImages=true] - If true, download and store remote images locally
 * @returns {Promise<Array>} Combined array of all articles
 */
export async function addArticles(newArticles, options) {
  try {
    const normalizedOptions = normalizeAddArticlesOptions(options);
    const existingArticles = await getAllArticles();
    const processedArticles = await processNewArticles(newArticles, existingArticles, normalizedOptions);
    return await saveArticlesToStorage(existingArticles, processedArticles);
  } catch (e) {
    logError('[galleryService]', 'addArticles error', e);
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
    logError('[galleryService]', 'deleteArticlesById error', e);
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
      logWarning('[galleryService]', 'No article IDs provided to incrementWearCount');
      return await getAllArticles();
    }
    
    logInfo('[galleryService]', `Incrementing wearCount for ${articleIds.length} articles`);
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
    logError('[galleryService]', 'incrementWearCount error', e);
    throw e;
  }
}

/**
 * Migrate existing articles to ensure they have wearCount field
 * @returns {Promise<{success: boolean, migratedCount: number, totalCount: number}>}
 */
export async function migrateArticlesWearCount() {
  try {
    logInfo('[galleryService]', 'Starting wearCount migration');
    
    // Get all articles without triggering other migrations
    const articles = await getAllArticles({ migrateImages: false });
    
    if (!articles || articles.length === 0) {
      logInfo('[galleryService]', 'No articles found to migrate wearCount');
      return { success: true, migratedCount: 0, totalCount: 0 };
    }
    
    // Count articles needing migration (those without wearCount)
    const needsMigration = articles.filter(article => 
      typeof article.wearCount !== 'number'
    );
    
    logInfo('[galleryService]', `Found ${needsMigration.length} of ${articles.length} articles needing wearCount migration`);
    
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
    
    logInfo('[galleryService]', `Successfully migrated wearCount for ${needsMigration.length} articles`);
    
    return { 
      success: true, 
      migratedCount: needsMigration.length, 
      totalCount: articles.length 
    };
  } catch (error) {
    logError('[galleryService]', 'Error during wearCount migration', error);
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
    logError('[galleryService]', 'clearAllArticles error', e);
    throw e;
  }
}
