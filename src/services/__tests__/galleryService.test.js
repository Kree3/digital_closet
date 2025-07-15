// galleryService.test.js
// Unit tests for galleryService.js
// Run with: npx jest src/services/__tests__/galleryService.test.js

import {
  getAllArticles,
  addArticles,
  deleteArticlesById,
  clearAllArticles,
  incrementWearCount,
  migrateArticlesWearCount
} from '../galleryService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrateAllArticleImages, migrateArticleImage } from '../imageStorageService';
import { logError, logWarning, logInfo } from '../errorHandlingService';

// Mock the image storage service
jest.mock('../imageStorageService', () => ({
  migrateAllArticleImages: jest.fn(),
  migrateArticleImage: jest.fn((article) => Promise.resolve({ ...article, localImageUri: 'local://migrated.jpg' }))
}));

// Mock the error handling service
jest.mock('../errorHandlingService', () => ({
  logError: jest.fn(),
  logWarning: jest.fn(),
  logInfo: jest.fn()
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('galleryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockReset();
    AsyncStorage.setItem.mockReset();
    AsyncStorage.removeItem.mockReset();
    migrateAllArticleImages.mockReset();
    migrateArticleImage.mockReset();
    logError.mockReset();
    logWarning.mockReset();
    logInfo.mockReset();
  });

  it('should return an empty array if storage contains malformed JSON', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('not-json');
    const result = await getAllArticles();
    expect(result).toEqual([]);
  });

  it('should return an empty array if nothing in storage', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await getAllArticles();
    expect(result).toEqual([]);
  });

  it('should add new articles and filter out duplicates by id', async () => {
    const existing = [
      { id: 'a', name: 'Shirt' },
      { id: 'b', name: 'Pants' }
    ];
    const newArticles = [
      { id: 'b', name: 'Pants' }, // duplicate
      { id: 'c', name: 'Jacket', imageUrl: 'http://example.com/jacket.jpg' }
    ];
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
    AsyncStorage.setItem.mockResolvedValueOnce();
    migrateArticleImage.mockResolvedValueOnce({ id: 'c', name: 'Jacket', imageUrl: 'http://example.com/jacket.jpg', localImageUri: 'local://migrated.jpg', wearCount: 0 });
    
    const result = await addArticles(newArticles);
    
    expect(result).toEqual([
      { id: 'a', name: 'Shirt' },
      { id: 'b', name: 'Pants' },
      { id: 'c', name: 'Jacket', imageUrl: 'http://example.com/jacket.jpg', localImageUri: 'local://migrated.jpg', wearCount: 0 }
    ]);
  });

  it('should initialize wearCount to 0 for new articles', async () => {
    const newArticles = [
      { id: 'a', name: 'Shirt', imageUri: 'local://shirt.jpg' },
      { id: 'b', name: 'Pants', imageUri: 'local://pants.jpg', wearCount: 5 }
    ];
    AsyncStorage.getItem.mockResolvedValueOnce('[]');
    AsyncStorage.setItem.mockResolvedValueOnce();
    const result = await addArticles(newArticles);
    expect(result[0].wearCount).toBe(0);
    expect(result[1].wearCount).toBe(5); // existing wearCount preserved
  });

  it('should filter out articles without image fields when validateImageFields is true', async () => {
    const newArticles = [
      { id: 'a', name: 'Shirt' }, // no image field
      { id: 'b', name: 'Pants', imageUri: 'local://pants.jpg' }
    ];
    AsyncStorage.getItem.mockResolvedValueOnce('[]');
    AsyncStorage.setItem.mockResolvedValueOnce();
    const result = await addArticles(newArticles, { validateImageFields: true });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('b');
  });

  it('should not filter articles without image fields when validateImageFields is false', async () => {
    const newArticles = [
      { id: 'a', name: 'Shirt' }, // no image field
      { id: 'b', name: 'Pants', imageUri: 'local://pants.jpg' }
    ];
    AsyncStorage.getItem.mockResolvedValueOnce('[]');
    AsyncStorage.setItem.mockResolvedValueOnce();
    const result = await addArticles(newArticles, { validateImageFields: false, migrateImages: false });
    expect(result.length).toBe(2);
    expect(result[0].wearCount).toBe(0);
    expect(result[1].wearCount).toBe(0);
  });

  it('should delete articles by id', async () => {
    const existing = [
      { id: 'a', name: 'Shirt' },
      { id: 'b', name: 'Pants' },
      { id: 'c', name: 'Jacket' }
    ];
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
    AsyncStorage.setItem.mockResolvedValueOnce();
    const result = await deleteArticlesById(['b']);
    expect(result).toEqual([
      { id: 'a', name: 'Shirt' },
      { id: 'c', name: 'Jacket' }
    ]);
  });

  it('should clear all articles', async () => {
    await clearAllArticles();
    expect(AsyncStorage.removeItem).toHaveBeenCalled();
  });

  describe('incrementWearCount', () => {
    it('should increment wearCount for specified articles', async () => {
      const existing = [
        { id: 'a', name: 'Shirt', wearCount: 2 },
        { id: 'b', name: 'Pants', wearCount: 0 },
        { id: 'c', name: 'Jacket', wearCount: 1 }
      ];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
      AsyncStorage.setItem.mockResolvedValueOnce();
      
      const result = await incrementWearCount(['a', 'c']);
      
      expect(result).toEqual([
        { id: 'a', name: 'Shirt', wearCount: 3 },
        { id: 'b', name: 'Pants', wearCount: 0 },
        { id: 'c', name: 'Jacket', wearCount: 2 }
      ]);
    });

    it('should handle articles without existing wearCount', async () => {
      const existing = [
        { id: 'a', name: 'Shirt' }, // no wearCount
        { id: 'b', name: 'Pants', wearCount: 1 }
      ];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
      AsyncStorage.setItem.mockResolvedValueOnce();
      
      const result = await incrementWearCount(['a']);
      
      expect(result[0].wearCount).toBe(1);
      expect(result[1].wearCount).toBe(1);
    });

    it('should return all articles if no IDs provided', async () => {
      const existing = [{ id: 'a', name: 'Shirt', wearCount: 0 }];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
      
      const result = await incrementWearCount([]);
      
      expect(result).toEqual(existing);
    });
  });

  describe('migrateArticlesWearCount', () => {
    it('should migrate articles without wearCount', async () => {
      const existing = [
        { id: 'a', name: 'Shirt' }, // no wearCount
        { id: 'b', name: 'Pants', wearCount: 5 } // has wearCount
      ];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
      AsyncStorage.setItem.mockResolvedValueOnce();
      
      const result = await migrateArticlesWearCount();
      
      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(1);
      expect(result.totalCount).toBe(2);
    });

    it('should return success with 0 migrations if all articles have wearCount', async () => {
      const existing = [
        { id: 'a', name: 'Shirt', wearCount: 2 },
        { id: 'b', name: 'Pants', wearCount: 0 }
      ];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
      
      const result = await migrateArticlesWearCount();
      
      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(0);
      expect(result.totalCount).toBe(2);
    });

    it('should handle empty articles array', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('[]');
      
      const result = await migrateArticlesWearCount();
      
      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getAllArticles with image migration', () => {
    it('should migrate images when migrateImages option is true', async () => {
      const articles = [
        { id: 'a', name: 'Shirt', imageUrl: 'http://example.com/shirt.jpg' },
        { id: 'b', name: 'Pants', localImageUri: 'local://pants.jpg' }
      ];
      const migratedArticles = [
        { id: 'a', name: 'Shirt', imageUrl: 'http://example.com/shirt.jpg', localImageUri: 'local://migrated-shirt.jpg' },
        { id: 'b', name: 'Pants', localImageUri: 'local://pants.jpg' }
      ];
      
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(articles));
      migrateAllArticleImages.mockResolvedValueOnce(migratedArticles);
      AsyncStorage.setItem.mockResolvedValueOnce();
      
      const result = await getAllArticles({ migrateImages: true });
      
      expect(migrateAllArticleImages).toHaveBeenCalledWith(articles);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('galleryArticles', JSON.stringify(migratedArticles));
      expect(result).toEqual(migratedArticles);
    });

    it('should not save if no articles were migrated', async () => {
      const articles = [
        { id: 'a', name: 'Shirt', localImageUri: 'local://shirt.jpg' }
      ];
      
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(articles));
      migrateAllArticleImages.mockResolvedValueOnce(articles); // No changes
      
      const result = await getAllArticles({ migrateImages: true });
      
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual(articles);
    });
  });

  describe('addArticles with options', () => {
    it('should skip image migration when migrateImages is false', async () => {
      const newArticles = [
        { id: 'a', name: 'Shirt', imageUrl: 'http://example.com/shirt.jpg' }
      ];
      
      AsyncStorage.getItem.mockResolvedValueOnce('[]');
      AsyncStorage.setItem.mockResolvedValueOnce();
      
      const result = await addArticles(newArticles, { migrateImages: false });
      
      expect(migrateArticleImage).not.toHaveBeenCalled();
      expect(result[0]).toEqual({ ...newArticles[0], wearCount: 0 });
    });

    it('should handle migration errors gracefully', async () => {
      const newArticles = [
        { id: 'a', name: 'Shirt', imageUrl: 'http://example.com/shirt.jpg' }
      ];
      
      AsyncStorage.getItem.mockResolvedValueOnce('[]');
      migrateArticleImage.mockRejectedValueOnce(new Error('Migration failed'));
      AsyncStorage.setItem.mockResolvedValueOnce();
      
      const result = await addArticles(newArticles);
      
      // Should still proceed even if migration fails
      expect(result.length).toBe(0); // Article filtered out due to migration failure
    });
  });

  describe('error handling', () => {
    it('should log errors and return empty array on getAllArticles failure', async () => {
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await getAllArticles();
      
      expect(logError).toHaveBeenCalledWith('[galleryService]', 'getAllArticles error', expect.any(Error));
      expect(result).toEqual([]);
    });

    it('should log errors and return empty array on addArticles failure', async () => {
      // getAllArticles() will succeed but AsyncStorage.setItem will fail
      AsyncStorage.getItem.mockResolvedValueOnce('[]'); // getAllArticles returns []
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await addArticles([{ id: 'a', name: 'Shirt', imageUri: 'local://shirt.jpg' }], { migrateImages: false });
      
      expect(logError).toHaveBeenCalledWith('[galleryService]', 'addArticles error', expect.any(Error));
      expect(result).toEqual([]);
    });

    it('should log errors and throw on deleteArticlesById failure', async () => {
      // getAllArticles() will return [] due to error handling, but AsyncStorage.setItem should fail
      AsyncStorage.getItem.mockResolvedValueOnce('[]'); // getAllArticles returns []
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(deleteArticlesById(['a'])).rejects.toThrow('Storage error');
      expect(logError).toHaveBeenCalledWith('[galleryService]', 'deleteArticlesById error', expect.any(Error));
    });

    it('should log errors and throw on clearAllArticles failure', async () => {
      AsyncStorage.removeItem.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(clearAllArticles()).rejects.toThrow('Storage error');
      expect(logError).toHaveBeenCalledWith('[galleryService]', 'clearAllArticles error', expect.any(Error));
    });

    it('should log errors and throw on incrementWearCount failure', async () => {
      // getAllArticles() will return [] due to error handling, but AsyncStorage.setItem should fail
      AsyncStorage.getItem.mockResolvedValueOnce('[]'); // getAllArticles returns []
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(incrementWearCount(['a'])).rejects.toThrow('Storage error');
      expect(logError).toHaveBeenCalledWith('[galleryService]', 'incrementWearCount error', expect.any(Error));
    });
  });

  describe('helper function integration', () => {
    it('should use logWarning when filtering articles without image fields', async () => {
      const newArticles = [
        { id: 'a', name: 'Shirt' }, // no image field
        { id: 'b', name: 'Pants', imageUri: 'local://pants.jpg' }
      ];
      
      AsyncStorage.getItem.mockResolvedValueOnce('[]');
      AsyncStorage.setItem.mockResolvedValueOnce();
      
      await addArticles(newArticles, { validateImageFields: true, migrateImages: false });
      
      expect(logWarning).toHaveBeenCalledWith('[galleryService]', 'Skipping article with ID a due to missing image fields');
    });

    it('should use logInfo for migration operations', async () => {
      const newArticles = [
        { id: 'a', name: 'Shirt', imageUrl: 'http://example.com/shirt.jpg' }
      ];
      
      AsyncStorage.getItem.mockResolvedValueOnce('[]');
      migrateArticleImage.mockResolvedValueOnce({ ...newArticles[0], localImageUri: 'local://migrated.jpg', wearCount: 0 });
      AsyncStorage.setItem.mockResolvedValueOnce();
      
      await addArticles(newArticles, { migrateImages: true });
      
      expect(logInfo).toHaveBeenCalledWith('[galleryService]', 'Migrating images for 1 new articles');
      expect(logInfo).toHaveBeenCalledWith('[galleryService]', 'Found 1 articles needing image migration');
    });

    it('should use logWarning for incrementWearCount with no IDs', async () => {
      const existing = [{ id: 'a', name: 'Shirt', wearCount: 0 }];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
      
      await incrementWearCount([]);
      
      expect(logWarning).toHaveBeenCalledWith('[galleryService]', 'No article IDs provided to incrementWearCount');
    });
  });
});
