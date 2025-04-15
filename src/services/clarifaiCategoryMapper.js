// clarifaiCategoryMapper.js
// Utility to map Clarifai clothing labels to app-standard categories
// Accepted categories: 'outerwear', 'tops', 'bottoms', 'shoes'

const labelToCategoryMap = {
  // Outerwear
  'jacket': 'outerwear',
  'jackets': 'outerwear',
  'coat': 'outerwear',
  'blazer': 'outerwear',
  'parka': 'outerwear',
  'windbreaker': 'outerwear',
  'vest': 'outerwear',
  // Tops
  'shirt': 'tops',
  'shirts': 'tops',
  't-shirt': 'tops',
  't-shirts': 'tops',
  'tee': 'tops',
  'tees': 'tops',
  'blouse': 'tops',
  'blouses': 'tops',
  'sweater': 'tops',
  'sweaters': 'tops',
  'hoodie': 'tops',
  'hoodies': 'tops',
  'tank top': 'tops',
  'tank tops': 'tops',
  'polo': 'tops',
  'polos': 'tops',
  // Bottoms
  'pants': 'bottoms',
  'jeans': 'bottoms',
  'trousers': 'bottoms',
  'shorts': 'bottoms',
  'skirt': 'bottoms',
  'skirts': 'bottoms',
  'leggings': 'bottoms',
  // Shoes
  'shoes': 'shoes',
  'shoe': 'shoes',
  'sneaker': 'shoes',
  'sneakers': 'shoes',
  'boot': 'shoes',
  'boots': 'shoes',
  'loafer': 'shoes',
  'loafers': 'shoes',
  'sandals': 'shoes',
  'sandal': 'shoes',
  'heel': 'shoes',
  'heels': 'shoes',
  'footwear': 'shoes', // Clarifai label
  // General/Other
  'clothing': 'tops', // fallback for generic label
};

export function mapClarifaiLabelToCategory(label) {
  if (!label) return 'other';
  const normalized = label.trim().toLowerCase();
  return labelToCategoryMap[normalized] || 'other';
}
