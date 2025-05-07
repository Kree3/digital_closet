// outfitService.js
// Service module for managing outfits in Digital Closet
// Handles all AsyncStorage operations and business logic for outfits
// Updated May 2025: Added functionality to track outfit usage

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { incrementWearCount } from './galleryService';

const OUTFITS_KEY = 'OUTFITS';

/**
 * Save a new outfit to storage.
 * @param {Object} params
 * @param {string} params.name - Name of the outfit
 * @param {Array} params.articles - Array of article objects
 * @returns {Promise<void>}
 * @throws {Error} if saving fails
 */
export async function saveOutfit({ name, articles }) {
  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error('Select at least 1 article to create an outfit.');
  }
  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    throw new Error('Outfit name cannot be empty.');
  }
  let existing = [];
  try {
    const stored = await AsyncStorage.getItem(OUTFITS_KEY);
    if (stored) {
      existing = JSON.parse(stored);
    }
  } catch (parseErr) {
    // If parsing fails, start fresh
    existing = [];
  }
  const newOutfit = {
    id: uuid.v4(),
    name: trimmedName,
    articleIds: articles.map((a) => a.id),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify([newOutfit, ...existing]));
}

/**
 * Get all outfits from storage.
 * @returns {Promise<Array>} Array of outfit objects
 */
export async function getOutfits() {
  try {
    console.log('[outfitService] Getting outfits from storage');
    const stored = await AsyncStorage.getItem(OUTFITS_KEY);
    if (stored) {
      const outfits = JSON.parse(stored);
      console.log(`[outfitService] Found ${outfits.length} outfits in storage`);
      return outfits;
    }
    console.log('[outfitService] No outfits found in storage');
    return [];
  } catch (e) {
    console.error('[outfitService] Error getting outfits:', e);
    return [];
  }
}

/**
 * Remove an outfit by id.
 * @param {string} id - Outfit ID
 * @returns {Promise<void>}
 */
export async function removeOutfit(id) {
  try {
    const stored = await AsyncStorage.getItem(OUTFITS_KEY);
    let outfits = stored ? JSON.parse(stored) : [];
    outfits = outfits.filter((o) => o.id !== id);
    await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
  } catch (e) {
    console.error('[outfitService] Failed to remove outfit:', e);
  }
}

/**
 * Mark an outfit as worn, incrementing the wearCount for all articles in the outfit
 * @param {string} outfitId - ID of the outfit that was worn
 * @returns {Promise<{success: boolean, articlesUpdated: number}>}
 */
export async function markOutfitAsWorn(outfitId) {
  try {
    console.log(`[outfitService] Marking outfit ${outfitId} as worn`);
    
    // Get the outfit
    const outfits = await getOutfits();
    const outfit = outfits.find(o => o.id === outfitId);
    
    if (!outfit) {
      console.error(`[outfitService] Outfit with ID ${outfitId} not found`);
      return { success: false, articlesUpdated: 0, error: 'Outfit not found' };
    }
    
    // Get the article IDs from the outfit
    const { articleIds } = outfit;
    
    if (!articleIds || !articleIds.length) {
      console.warn(`[outfitService] Outfit ${outfitId} has no articles`);
      return { success: true, articlesUpdated: 0 };
    }
    
    // Increment wear count for all articles in the outfit
    await incrementWearCount(articleIds);
    
    // Update the outfit's lastWorn date (for potential future use)
    const updatedOutfits = outfits.map(o => {
      if (o.id === outfitId) {
        return {
          ...o,
          lastWorn: new Date().toISOString(),
          wearCount: (o.wearCount || 0) + 1
        };
      }
      return o;
    });
    
    // Save the updated outfits
    await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(updatedOutfits));
    
    console.log(`[outfitService] Successfully marked outfit ${outfitId} as worn, updated ${articleIds.length} articles`);
    
    return { 
      success: true, 
      articlesUpdated: articleIds.length,
      outfit: updatedOutfits.find(o => o.id === outfitId)
    };
  } catch (error) {
    console.error('[outfitService] Error marking outfit as worn:', error);
    return { 
      success: false, 
      articlesUpdated: 0, 
      error: error.message || String(error)
    };
  }
}
