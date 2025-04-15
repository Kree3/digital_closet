// ClothingArticle.js
// Model for a clothing article
// ClothingArticle.js
// Model for a clothing article
// Accepted categories: 'outerwear', 'tops', 'bottoms', 'shoes'
export default class ClothingArticle {
  /**
   * @param {string} id - Unique identifier for the article
   * @param {string} imageUri - URI to the image of the article
   * @param {string} category - Category of the article (outerwear, tops, bottoms, shoes)
   * @param {boolean} confirmed - Whether the article has been verified by the user
   */
  constructor(id, imageUri, category, confirmed = false) {
    this.id = id;
    this.imageUri = imageUri;
    this.category = category; // 'outerwear', 'tops', 'bottoms', or 'shoes'
    this.confirmed = confirmed;
  }
}

