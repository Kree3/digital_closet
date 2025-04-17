// garmentVisionService.test.js
// Unit tests for GarmentVision pipeline service
// Run with: npx jest src/services/__tests__/garmentVisionService.test.js

import { processGarmentImage, dataUriToBlob } from '../garmentVisionService';

global.fetch = jest.fn();

describe('garmentVisionService', () => {
  it('should set imageUrl to null and add .error on DALL-E failure', async () => {
    // Mock describeGarmentImage to return a single article
    const mockDescribe = jest.fn().mockResolvedValue([{ id: 1, description: 'test shirt', category: 'shirt', color: 'blue' }]);
    jest.doMock('../garmentDescriptionService', () => ({ describeGarmentImage: mockDescribe }));
    // Mock generateGarmentImage to throw
    jest.doMock('../garmentImageGenerationService', () => ({ generateGarmentImage: () => { throw new Error('DALL-E failed'); } }));
    const { processGarmentImage } = require('../garmentVisionService');
    const result = await processGarmentImage('dummy', { openaiApiKey: 'sk-test' });
    expect(result[0].imageUrl).toBeNull();
    expect(result[0].error).toBe('DALL-E failed');
  });
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should throw if no API key is provided', async () => {
    await expect(processGarmentImage('dummy', {})).rejects.toThrow('Missing OpenAI API key');
  });

  it('should call GPT-4o-mini and DALL-E endpoints and return processed data', async () => {
    // Mock GPT-4o-mini response
    // Use a minimal valid PNG base64 string
    const defaultBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA';
    fetch.mockResolvedValueOnce({
      json: async () => ({
        choices: [
          { message: { content: JSON.stringify({
            bounding_box: { x: 10, y: 20, w: 100, h: 200 },
            mask_png_b64: defaultBase64,
            metadata: { color: 'black', type: 'shirt' }
          }) } }
        ]
      })
    });
    // Mock DALL-E edits response
    fetch.mockResolvedValueOnce({
      json: async () => ({ data: [ { url: 'https://mocked-url.com/retouched.png' } ] })
    });

    const result = await processGarmentImage(defaultBase64, { openaiApiKey: 'test-key' });
    expect(result.boundingBox).toEqual({ x: 10, y: 20, w: 100, h: 200 });
    expect(result.maskPngB64).toBe(defaultBase64);
    expect(result.retouchedUrl).toBe('https://mocked-url.com/retouched.png');
    expect(result.metadata).toEqual({ color: 'black', type: 'shirt' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw if GPT-4o-mini response is malformed', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ choices: [ { message: { content: 'not-json' } } ] })
    });
    await expect(processGarmentImage('img', { openaiApiKey: 'key' })).rejects.toThrow('Failed to parse GPT-4o-mini response');
  });

  it('dataUriToBlob returns a Blob object', () => {
    const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const dataUri = `data:image/png;base64,${b64}`;
    const blob = dataUriToBlob(dataUri);
    expect(blob instanceof Blob).toBe(true);
    expect(blob.type).toBe('image/png');
  });
});
