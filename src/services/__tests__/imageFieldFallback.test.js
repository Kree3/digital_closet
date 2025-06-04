// __tests__/imageFieldFallback.test.js
// Regression test for robust image field fallback logic in CategoryCarousel and CreateOutfitScreen
// Ensures correct image source is selected for all supported pipelines (Clarifai, OpenAI, future)

import React from 'react';
import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import CategoryCarousel from '../../components/CategoryCarousel';
import CreateOutfitScreen from '../../screens/CreateOutfitScreen';

const mockArticles = [
  { id: '1', description: 'Clarifai item', croppedImageUri: 'clarifai-cropped.png' },
  { id: '2', description: 'Clarifai fallback', imageUri: 'clarifai-image.png' },
  { id: '3', description: 'OpenAI item', imageUrl: 'openai-image.png' },
  { id: '4', description: 'All fields', croppedImageUri: 'cropped.png', imageUri: 'image.png', imageUrl: 'url.png' },
  { id: '5', description: 'No image fields' },
];

describe('CategoryCarousel image field fallback', () => {
  it('renders the correct image for each article', () => {
    const { UNSAFE_getAllByType } = render(
  <CategoryCarousel
    category="Test"
    articles={mockArticles}
    onItemPress={() => {}}
  />
);
const images = UNSAFE_getAllByType(Image);
    expect(images[0].props.source.uri).toBe('clarifai-cropped.png');
    expect(images[1].props.source.uri).toBe('clarifai-image.png');
    expect(images[2].props.source.uri).toBe('openai-image.png');
    expect(images[3].props.source.uri).toBe('cropped.png'); // croppedImageUri takes precedence
    expect(images.length).toBe(4); // Expect 4 Image components, as the 5th article renders a placeholder View
  });
});

// Note: For CreateOutfitScreen, image fallback is handled the same way. Testing the component directly is complex due to navigation/route mocks.
// Instead, test the fallback logic in isolation if refactored, or rely on CategoryCarousel coverage for now.
