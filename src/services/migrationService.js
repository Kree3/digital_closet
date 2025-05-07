// migrationService.js
// Service for handling data migrations and fixes for the Digital Closet app
// Addresses issues like image persistence and data model changes

import { getAllArticles } from './galleryService';
import { migrateAllArticleImages } from './imageStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GALLERY_ARTICLES_KEY } from './constants';

/**
 * Migrate all articles with remote imageUrl to have local image copies
 * This fixes the image persistence issue with expiring OpenAI DALL-E URLs
 * @returns {Promise<{success: boolean, migratedCount: number, totalCount: number}>}
 */
export async function migrateRemoteImagesToLocal() {
  try {
    console.log('[migrationService] Starting image persistence migration');
    
    // Get all articles without triggering automatic migration
    const articles = await getAllArticles({ migrateImages: false });
    
    if (!articles || articles.length === 0) {
      console.log('[migrationService] No articles found to migrate');
      return { success: true, migratedCount: 0, totalCount: 0 };
    }
    
    // Count articles needing migration (those with imageUrl but no localImageUri)
    const needsMigration = articles.filter(article => 
      article.imageUrl && !article.localImageUri
    );
    
    console.log(`[migrationService] Found ${needsMigration.length} of ${articles.length} articles needing image migration`);
    
    if (needsMigration.length === 0) {
      return { success: true, migratedCount: 0, totalCount: articles.length };
    }
    
    // Migrate all articles
    const migratedArticles = await migrateAllArticleImages(articles);
    
    // Save the migrated articles back to storage
    await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(migratedArticles));
    
    console.log(`[migrationService] Successfully migrated ${needsMigration.length} articles`);
    
    return { 
      success: true, 
      migratedCount: needsMigration.length, 
      totalCount: articles.length 
    };
  } catch (error) {
    console.error('[migrationService] Error during image persistence migration:', error);
    return { 
      success: false, 
      error: error.message || String(error),
      migratedCount: 0, 
      totalCount: 0 
    };
  }
}

/**
 * Run all necessary migrations based on app version
 * This function should be called during app startup
 * @param {string} currentVersion - Current app version
 * @returns {Promise<{success: boolean, migrations: Array}>}
 */
export async function runMigrations(currentVersion) {
  try {
    console.log(`[migrationService] Running migrations for version ${currentVersion}`);
    
    const completedMigrations = [];
    
    // Migration: Image persistence
    const imageMigrationResult = await migrateRemoteImagesToLocal();
    completedMigrations.push({
      name: 'image-persistence',
      ...imageMigrationResult
    });
    
    // Add more migrations here as needed
    
    return {
      success: true,
      migrations: completedMigrations
    };
  } catch (error) {
    console.error('[migrationService] Error running migrations:', error);
    return {
      success: false,
      error: error.message || String(error),
      migrations: []
    };
  }
}
