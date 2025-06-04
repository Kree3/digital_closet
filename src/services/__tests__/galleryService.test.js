// galleryService.test.js
// Unit tests for galleryService.js
// Run with: npx jest src/services/__tests__/galleryService.test.js

import {
  getAllArticles,
  addArticles,
  deleteArticlesById,
  clearAllArticles
} from '../galleryService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('galleryService', () => {
  it('should return an empty array if storage contains malformed JSON', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('not-json');
    const result = await getAllArticles();
    expect(result).toEqual([]);
  });
  beforeEach(() => {
    AsyncStorage.getItem.mockReset();
    AsyncStorage.setItem.mockReset();
    AsyncStorage.removeItem.mockReset();
  });

  it('should return an empty array if nothing in storage', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await getAllArticles();
    expect(result).toEqual([]);
  });

  it('should add new articles and filter out duplicates by id', async () => {
    const existing = [
      { id: 'a', name: 'Shirt', imageUrl: 'http://example.com/shirt.jpg' },
      { id: 'b', name: 'Pants', imageUrl: 'http://example.com/pants.jpg' }
    ];
    const newArticles = [
      { id: 'b', name: 'Pants', imageUrl: 'http://example.com/pants.jpg' }, // duplicate
      { id: 'c', name: 'Jacket', imageUrl: 'http://example.com/jacket.jpg' }
    ];
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing)); // Mock for the initial read in addArticles
    AsyncStorage.setItem.mockResolvedValue(undefined); // Mock for all setItem calls within addArticles flow
    const result = await addArticles(newArticles);
    expect(result).toEqual([
      { id: 'a', name: 'Shirt', imageUrl: 'http://example.com/shirt.jpg', localImageUri: expect.any(String) },
      { id: 'b', name: 'Pants', imageUrl: 'http://example.com/pants.jpg', localImageUri: expect.any(String) },
      { id: 'c', name: 'Jacket', imageUrl: 'http://example.com/jacket.jpg', localImageUri: expect.any(String), wearCount: 0 }
    ]);
    expect(AsyncStorage.setItem).toHaveBeenCalled(); // Check it was called
    const lastSetItemCall = AsyncStorage.setItem.mock.calls[AsyncStorage.setItem.mock.calls.length - 1];
    expect(lastSetItemCall[0]).toBe('galleryArticles'); // Check the key
    const savedArticles = JSON.parse(lastSetItemCall[1]);
    expect(savedArticles).toEqual([
      expect.objectContaining({ id: 'a', name: 'Shirt', imageUrl: 'http://example.com/shirt.jpg', localImageUri: expect.any(String) }),
      expect.objectContaining({ id: 'b', name: 'Pants', imageUrl: 'http://example.com/pants.jpg', localImageUri: expect.any(String) }),
      expect.objectContaining({ id: 'c', name: 'Jacket', imageUrl: 'http://example.com/jacket.jpg', localImageUri: expect.any(String), wearCount: 0 })
    ]);
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
});
