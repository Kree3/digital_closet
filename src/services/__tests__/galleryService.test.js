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
  beforeEach(() => {
    jest.clearAllMocks();
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
      { id: 'c', name: 'Jacket' }
    ];
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));
    AsyncStorage.setItem.mockResolvedValueOnce();
    const result = await addArticles(newArticles);
    expect(result).toEqual([
      { id: 'a', name: 'Shirt' },
      { id: 'b', name: 'Pants' },
      { id: 'c', name: 'Jacket' }
    ]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify([
        { id: 'a', name: 'Shirt' },
        { id: 'b', name: 'Pants' },
        { id: 'c', name: 'Jacket' }
      ])
    );
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
