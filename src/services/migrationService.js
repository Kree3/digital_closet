// migrationService.js
// Service for handling data migrations and fixes for the Digital Closet app
// Addresses issues like image persistence and data model changes
// Updated May 2025: Added wearCount migration

import { getAllArticles, migrateArticlesWearCount } from './galleryService';
import { migrateAllArticleImages } from './imageStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GALLERY_ARTICLES_KEY } from './constants';

/**
 * Migrate all articles with remote imageUrl to have local image copies
 * This fixes the image persistence issue with expiring OpenAI DALL-E URLs
 * @returns {Promise<{success: boolean, migratedCount: number, totalCount: number}>}
 */
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
    
    // Migration: Add wearCount field to articles
    const wearCountMigrationResult = await migrateArticlesWearCount();
    completedMigrations.push({
      name: 'wear-count',
      ...wearCountMigrationResult
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
