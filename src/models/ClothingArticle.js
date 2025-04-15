// ClothingArticle.js
// Model for a clothing article
export default class ClothingArticle {
  constructor(id, imageUri, confirmed = false) {
    this.id = id;
    this.imageUri = imageUri;
    this.confirmed = confirmed;
  }
}
