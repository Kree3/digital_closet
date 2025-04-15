// mockImageProcessingService.js
// Mocks image processing API for development
export function mockSeparateClothingItems(imageUri) {
  // For now, return 3 fake articles (all using the same image)
  return [
    { id: '1', imageUri, confirmed: false },
    { id: '2', imageUri, confirmed: false },
    { id: '3', imageUri, confirmed: false },
  ];
}
