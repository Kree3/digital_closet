// outfitService.js
// Service module for managing outfits in Digital Closet
// Handles all AsyncStorage operations and business logic for outfits

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

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
    const stored = await AsyncStorage.getItem(OUTFITS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (e) {
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
    // Fail silently for now
  }
}
