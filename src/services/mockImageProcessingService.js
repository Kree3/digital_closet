// mockImageProcessingService.js
// Mocks image processing API for development

// Generate a globally unique id
const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function mockSeparateClothingItems(imageUri) {
  return [
    { id: generateUniqueId(), imageUri, confirmed: false },
    { id: generateUniqueId(), imageUri, confirmed: false },
    { id: generateUniqueId(), imageUri, confirmed: false },
  ];
}
