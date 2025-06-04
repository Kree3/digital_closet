// garmentVisionService.test.js
// Unit tests for GarmentVision pipeline service
// Run with: npx jest src/services/__tests__/garmentVisionService.test.js

import { processGarmentImage, dataUriToBlob } from '../garmentVisionService';

// Mock the dynamically imported services and other direct imports
jest.mock('../garmentDescriptionService.js', () => ({
  describeGarmentImage: jest.fn(),
}));
jest.mock('../garmentImageGenerationService.js', () => ({
  generateGarmentImage: jest.fn(),
}));
jest.mock('../imageStorageService.js', () => ({
  downloadAndSaveImage: jest.fn(),
}));

// Import the mocked functions to easily access/reset them
import { describeGarmentImage } from '../garmentDescriptionService.js';
import { generateGarmentImage } from '../garmentImageGenerationService.js';
import { downloadAndSaveImage } from '../imageStorageService.js';

global.fetch = jest.fn(); // If any part of the service (not covered by above mocks) uses fetch

describe('garmentVisionService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    fetch.mockClear();
    describeGarmentImage.mockClear();
    generateGarmentImage.mockClear();
    downloadAndSaveImage.mockClear();
  });

  it('should set imageUrl to null and add .error on generateGarmentImage failure', async () => {
    const dummyBase64 = 'dummy-base64-image';
    const mockApiOptions = { openaiApiKey: 'sk-test' };
    const mockDescriptionResult = [{ id: 1, description: 'test shirt', category: 'shirt', color: 'blue' }];

    describeGarmentImage.mockResolvedValue(mockDescriptionResult);
    generateGarmentImage.mockRejectedValue(new Error('DALL-E failed'));
    // downloadAndSaveImage will not be called if generateGarmentImage fails

    const result = await processGarmentImage(dummyBase64, mockApiOptions);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].imageUrl).toBeNull();
    expect(result[0].error).toBe('DALL-E failed');
    expect(describeGarmentImage).toHaveBeenCalledWith(dummyBase64, mockApiOptions);
    expect(generateGarmentImage).toHaveBeenCalledWith(mockDescriptionResult[0].description, mockApiOptions);
    expect(downloadAndSaveImage).not.toHaveBeenCalled();
  });

  it('should return an error object if no API key is provided', async () => {
    const result = await processGarmentImage('dummy', {}); // No API key
    expect(result).toEqual({
      error: true,
      message: 'Missing OpenAI API key',
      stage: 'pipeline', // As it's caught by the main try-catch
    });
  });

  it('should return processed data including localImageUri from mocked services', async () => {
    const defaultBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const mockApiOptions = { openaiApiKey: 'test-key' };
    const mockDescription = [{ id: 'item1', description: 'black shirt', category: 'shirt', color: 'black' }];
    const mockGeneratedUrl = 'https://mocked-url.com/retouched.png';
    const mockLocalUrl = 'file:///local/retouched.png';

    describeGarmentImage.mockResolvedValue(mockDescription);
    generateGarmentImage.mockResolvedValue(mockGeneratedUrl);
    downloadAndSaveImage.mockResolvedValue(mockLocalUrl);

    const result = await processGarmentImage(defaultBase64, mockApiOptions);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    const articleResult = result[0];
    expect(articleResult.id).toBe('item1');
    expect(articleResult.description).toBe('black shirt');
    expect(articleResult.imageUrl).toBe(mockGeneratedUrl);
    expect(articleResult.localImageUri).toBe(mockLocalUrl);

    expect(describeGarmentImage).toHaveBeenCalledWith(defaultBase64, mockApiOptions);
    expect(generateGarmentImage).toHaveBeenCalledWith(mockDescription[0].description, mockApiOptions);
    expect(downloadAndSaveImage).toHaveBeenCalledWith(mockGeneratedUrl);
  });

  it('should handle errors from describeGarmentImage and return error object', async () => {
    const dummyBase64 = 'img';
    const mockApiOptions = { openaiApiKey: 'key' };
    describeGarmentImage.mockRejectedValue(new Error('GPT-4o-mini failed'));

    const result = await processGarmentImage(dummyBase64, mockApiOptions);
    
    // The error from describeGarmentImage is caught by the inner try-catch in processGarmentImage
    // which then returns an error object specific to that stage.
    expect(result).toEqual({
      error: true,
      message: 'GPT-4o-mini failed',
      stage: 'describeGarmentImage',
    });
  });

  it('should return an error object if no clothing items are detected by describeGarmentImage', async () => {
    const dummyBase64 = 'empty-image';
    const mockApiOptions = { openaiApiKey: 'test-key' };
    describeGarmentImage.mockResolvedValue([]); // No items detected

    const result = await processGarmentImage(dummyBase64, mockApiOptions);

    expect(result).toEqual({
      error: true,
      message: 'No clothing items detected in the image.',
      stage: 'describeGarmentImage',
    });
  });

  it('dataUriToBlob returns a Blob object', () => {
    const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const dataUri = `data:image/png;base64,${b64}`;
    const blob = dataUriToBlob(dataUri);
    expect(blob instanceof Blob).toBe(true);
    expect(blob.type).toBe('image/png');
  });
});
