// verificationImageField.test.js
// Regression test: Every article added via verification flow should have at least one image field (croppedImageUri, imageUri, imageUrl)

import { addArticles } from '../galleryService';

const validArticle = { id: '1', croppedImageUri: 'img1.png' };
const fallbackArticle = { id: '2', imageUri: 'img2.png' };
const urlArticle = { id: '3', imageUrl: 'img3.png' };
const missingImageArticle = { id: '4', name: 'No image' };

describe('Verification flow article image fields', () => {
  it('should filter out articles without image fields by default', async () => {
    const articles = [validArticle, fallbackArticle, urlArticle, missingImageArticle];
    // With default validation enabled
    const saved = await addArticles(articles);
    
    // Should only have 3 articles (the ones with image fields)
    expect(saved.filter(a => a.id === '1' || a.id === '2' || a.id === '3').length).toBe(3);
    // The article without image fields should be filtered out
    expect(saved.find(a => a.id === '4')).toBeUndefined();
    
    // All saved articles should have at least one image field
    for (const article of saved) {
      const hasImage = article.croppedImageUri || article.imageUri || article.imageUrl;
      expect(hasImage).toBeTruthy();
    }
  });
  
  it('should allow articles without image fields when validation is disabled', async () => {
    const articles = [validArticle, fallbackArticle, urlArticle, missingImageArticle];
    // Disable validation
    const saved = await addArticles(articles, { validateImageFields: false });
    
    // Should have all 4 articles
    expect(saved.filter(a => a.id === '1' || a.id === '2' || a.id === '3' || a.id === '4').length).toBe(4);
    
    // The article without image fields should be included
    const missingImageSaved = saved.find(a => a.id === '4');
    expect(missingImageSaved).toBeDefined();
    expect(missingImageSaved.croppedImageUri || missingImageSaved.imageUri || missingImageSaved.imageUrl).toBeFalsy();
  });
});
