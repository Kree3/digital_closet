// verificationService.test.js
// Tests for verificationService.js

import { processImageForVerification, processSelectedArticles } from '../verificationService';
import { processGarmentImage } from '../garmentVisionService';
import { detectClothingArticles, cropArticlesFromImage } from '../imageProcessingService';
import { mapClarifaiLabelToCategory } from '../clarifaiCategoryMapper';
import * as ImageManipulator from 'expo-image-manipulator';

// Mock the dependencies
jest.mock('../garmentVisionService');
jest.mock('../imageProcessingService');
jest.mock('../clarifaiCategoryMapper');
jest.mock('expo-image-manipulator');
jest.mock('../uuid', () => jest.fn(() => 'test-uuid-123'));

// Set up the mock for imageProvider before importing the service
// This needs to be done with a manual mock to avoid import resolution issues
const mockImageProvider = {
  IMAGE_PROCESSING_PROVIDER: 'garmentVision' // Test with GarmentVision by default
};

// Manually mock the module
jest.mock('../config/imageProvider', () => mockImageProvider, { virtual: true });

describe('verificationService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    ImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'manipulated-uri',
      base64: 'test-base64-data'
    });
    
    processGarmentImage.mockResolvedValue({
      name: 'Test Garment',
      category: 'shirt',
      imageUrl: 'https://example.com/image.jpg'
    });
    
    detectClothingArticles.mockResolvedValue([
      { id: 'clarifai-1', name: 'Test Shirt', boundingBox: { x: 0, y: 0, w: 100, h: 100 } }
    ]);
    
    cropArticlesFromImage.mockResolvedValue([
      { id: 'crop-1', name: 'Test Shirt', croppedImageUri: 'cropped-uri-1' }
    ]);
    
    mapClarifaiLabelToCategory.mockReturnValue('tops');
  });
  
  describe('processImageForVerification', () => {
    it('should process image with GarmentVision successfully', async () => {
      const result = await processImageForVerification('data:image/jpeg;base64,test123', {
        openaiApiKey: 'test-key'
      });
      
      expect(result.error).toBeNull();
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0]).toHaveProperty('id', 'test-uuid-123');
      expect(result.articles[0]).toHaveProperty('name', 'Test Garment');
      expect(processGarmentImage).toHaveBeenCalledWith('test123', { openaiApiKey: 'test-key' });
    });
    
    it('should handle base64 extraction from file URI', async () => {
      const result = await processImageForVerification('file:///path/to/image.jpg', {
        openaiApiKey: 'test-key'
      });
      
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
      expect(result.error).toBeNull();
      expect(result.articles).toHaveLength(1);
    });
    
    it('should handle errors in image processing', async () => {
      processGarmentImage.mockRejectedValue(new Error('API error'));
      
      const result = await processImageForVerification('data:image/jpeg;base64,test123', {
        openaiApiKey: 'test-key'
      });
      
      expect(result.error).not.toBeNull();
      expect(result.articles).toHaveLength(0);
    });
    
    it('should handle missing image URI', async () => {
      const result = await processImageForVerification(null);
      
      expect(result.error).toBe('No image provided');
      expect(result.articles).toHaveLength(0);
    });
  });
  
  describe('processSelectedArticles', () => {
    it('should process selected articles with GarmentVision', async () => {
      const articles = [
        { id: '1', name: 'Shirt', category: 'shirt' },
        { id: '2', name: 'Pants', category: 'pants' }
      ];
      
      const result = await processSelectedArticles('image-uri', articles, ['1']);
      
      expect(result.error).toBeNull();
      expect(result.finalArticles).toHaveLength(1);
      expect(result.finalArticles[0]).toHaveProperty('category', 'tops'); // Mapped category
      expect(mapClarifaiLabelToCategory).toHaveBeenCalledWith('shirt');
    });
    
    it('should handle empty selection', async () => {
      const result = await processSelectedArticles('image-uri', [], []);
      
      expect(result.error).toBe('No articles selected');
      expect(result.finalArticles).toHaveLength(0);
    });
  });
});
