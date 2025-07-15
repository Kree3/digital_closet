// garmentVisionService.test.js
// Unit tests for GarmentVision pipeline service
// Run with: npx jest src/services/__tests__/garmentVisionService.test.js

import { processGarmentImage, dataUriToBlob } from '../garmentVisionService';
import { describeGarmentImage } from '../garmentDescriptionService';
import { generateGarmentImage } from '../garmentImageGenerationService';
import { downloadAndSaveImage } from '../imageStorageService';

// Mock dependencies
jest.mock('../garmentDescriptionService');
jest.mock('../garmentImageGenerationService');
jest.mock('../imageStorageService');

global.fetch = jest.fn();
global.atob = jest.fn();
global.ArrayBuffer = ArrayBuffer;
global.Uint8Array = Uint8Array;
global.Blob = jest.fn();

describe('garmentVisionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    // Reset console methods to avoid pollution
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return error object if no API key is provided', async () => {
    const result = await processGarmentImage('dummy', {});
    expect(result.error).toBe(true);
    expect(result.message).toBe('Missing OpenAI API key');
    expect(result.stage).toBe('pipeline');
  });

  it('should return error object if describeGarmentImage fails', async () => {
    describeGarmentImage.mockRejectedValue(new Error('Description failed'));
    
    const result = await processGarmentImage('dummy', { openaiApiKey: 'test-key' });
    
    expect(result.error).toBe(true);
    expect(result.message).toBe('Description failed');
    expect(result.stage).toBe('describeGarmentImage');
  });

  it('should return error object if no clothing items detected', async () => {
    describeGarmentImage.mockResolvedValue([]);
    
    const result = await processGarmentImage('dummy', { openaiApiKey: 'test-key' });
    
    expect(result.error).toBe(true);
    expect(result.message).toBe('No clothing items detected in the image.');
    expect(result.stage).toBe('describeGarmentImage');
  });

  it('should successfully process clothing items and return array of articles', async () => {
    const mockClothingItems = [
      { id: '1', description: 'Blue shirt', category: 'shirt' },
      { id: '2', description: 'Black pants', category: 'pants' }
    ];
    
    describeGarmentImage.mockResolvedValue(mockClothingItems);
    generateGarmentImage.mockResolvedValue('https://example.com/generated.png');
    downloadAndSaveImage.mockResolvedValue('local://saved-image.png');
    
    const result = await processGarmentImage('base64image', { openaiApiKey: 'test-key' });
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: '1',
      description: 'Blue shirt',
      category: 'shirt',
      imageUrl: 'https://example.com/generated.png',
      localImageUri: 'local://saved-image.png'
    });
    expect(result[1]).toEqual({
      id: '2',
      description: 'Black pants',
      category: 'pants',
      imageUrl: 'https://example.com/generated.png',
      localImageUri: 'local://saved-image.png'
    });
  });

  it('should handle image generation failure gracefully', async () => {
    const mockClothingItems = [
      { id: '1', description: 'Blue shirt', category: 'shirt' }
    ];
    
    describeGarmentImage.mockResolvedValue(mockClothingItems);
    generateGarmentImage.mockRejectedValue(new Error('DALL-E failed'));
    
    const result = await processGarmentImage('base64image', { openaiApiKey: 'test-key' });
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '1',
      description: 'Blue shirt',
      category: 'shirt',
      imageUrl: null,
      error: 'DALL-E failed'
    });
  });

  it('should continue processing if local image save fails', async () => {
    const mockClothingItems = [
      { id: '1', description: 'Blue shirt', category: 'shirt' }
    ];
    
    describeGarmentImage.mockResolvedValue(mockClothingItems);
    generateGarmentImage.mockResolvedValue('https://example.com/generated.png');
    downloadAndSaveImage.mockRejectedValue(new Error('Storage failed'));
    
    const result = await processGarmentImage('base64image', { openaiApiKey: 'test-key' });
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '1',
      description: 'Blue shirt',
      category: 'shirt',
      imageUrl: 'https://example.com/generated.png'
      // Note: no localImageUri due to storage failure, but processing continues
    });
  });

  describe('helper functions', () => {
    describe('dataUriToBlob', () => {
      beforeEach(() => {
        // Mock atob to return a simple string
        global.atob = jest.fn((str) => 'mock-binary-data');
        // Mock Blob constructor
        global.Blob = jest.fn().mockImplementation((data, options) => ({
          data,
          type: options?.type || 'application/octet-stream',
          size: data[0]?.byteLength || 0
        }));
      });

      it('should convert data URI to Blob object', () => {
        const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA';
        const dataUri = `data:image/png;base64,${b64}`;
        
        const blob = dataUriToBlob(dataUri);
        
        expect(global.atob).toHaveBeenCalledWith(b64);
        expect(global.Blob).toHaveBeenCalledWith(
          [expect.any(ArrayBuffer)], 
          { type: 'image/png' }
        );
        expect(blob.type).toBe('image/png');
      });

      it('should handle different MIME types', () => {
        const dataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ';
        
        const blob = dataUriToBlob(dataUri);
        
        expect(blob.type).toBe('image/jpeg');
      });

      it('should handle data URI without base64 prefix', () => {
        const dataUri = 'data:text/plain,Hello%20World';
        
        // This would fail in real implementation but we're testing the parsing
        expect(() => dataUriToBlob(dataUri)).not.toThrow();
      });
    });
  });

  describe('validation functions', () => {
    it('should throw error for missing API key', async () => {
      const result = await processGarmentImage('base64image', {});
      
      expect(result.error).toBe(true);
      expect(result.message).toBe('Missing OpenAI API key');
    });

    it('should throw error for null API key', async () => {
      const result = await processGarmentImage('base64image', { openaiApiKey: null });
      
      expect(result.error).toBe(true);
      expect(result.message).toBe('Missing OpenAI API key');
    });

    it('should throw error for empty string API key', async () => {
      const result = await processGarmentImage('base64image', { openaiApiKey: '' });
      
      expect(result.error).toBe(true);
      expect(result.message).toBe('Missing OpenAI API key');
    });
  });

  describe('pipeline error handling', () => {
    it('should handle unexpected errors in pipeline', async () => {
      // Force an unexpected error by providing invalid base64Image
      describeGarmentImage.mockImplementation(() => {
        throw new Error('Unexpected pipeline error');
      });
      
      const result = await processGarmentImage('invalid-base64', { openaiApiKey: 'test-key' });
      
      expect(result.error).toBe(true);
      expect(result.message).toBe('Unexpected pipeline error');
      expect(result.stage).toBe('describeGarmentImage');
    });

    it('should handle string errors from garment description', async () => {
      describeGarmentImage.mockRejectedValue('String error message');
      
      const result = await processGarmentImage('base64image', { openaiApiKey: 'test-key' });
      
      expect(result.error).toBe(true);
      expect(result.message).toBe('String error message');
      expect(result.stage).toBe('describeGarmentImage');
    });

    it('should handle non-array response from garment description', async () => {
      describeGarmentImage.mockResolvedValue({ notAnArray: true });
      
      const result = await processGarmentImage('base64image', { openaiApiKey: 'test-key' });
      
      expect(result.error).toBe(true);
      expect(result.message).toBe('No clothing items detected in the image.');
      expect(result.stage).toBe('describeGarmentImage');
    });
  });

  describe('console logging', () => {
    it('should log processing steps', async () => {
      const mockClothingItems = [
        { id: '1', description: 'Blue shirt', category: 'shirt' }
      ];
      
      describeGarmentImage.mockResolvedValue(mockClothingItems);
      generateGarmentImage.mockResolvedValue('https://example.com/generated.png');
      downloadAndSaveImage.mockResolvedValue('local://saved-image.png');
      
      await processGarmentImage('base64image', { openaiApiKey: 'test-key' });
      
      expect(console.log).toHaveBeenCalledWith(
        '[garmentVisionService] processGarmentImage called with base64Image length:',
        'base64image'.length,
        'options:',
        { openaiApiKey: 'test-key' }
      );
      expect(console.log).toHaveBeenCalledWith(
        '[garmentVisionService] describeGarmentImage result:',
        mockClothingItems
      );
    });

    it('should log warnings for no clothing items', async () => {
      describeGarmentImage.mockResolvedValue([]);
      
      await processGarmentImage('base64image', { openaiApiKey: 'test-key' });
      
      expect(console.warn).toHaveBeenCalledWith(
        '[garmentVisionService] No clothing items detected in the image.'
      );
    });

    it('should log errors for failed operations', async () => {
      describeGarmentImage.mockRejectedValue(new Error('Test error'));
      
      await processGarmentImage('base64image', { openaiApiKey: 'test-key' });
      
      expect(console.error).toHaveBeenCalledWith(
        '[garmentVisionService] Error in describeGarmentImage:',
        expect.any(Error)
      );
    });
  });
});
