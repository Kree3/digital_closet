// VerificationScreen.js
//
// Verification Screen for Digital Closet
// -------------------------------------
// Allows users to confirm and select detected clothing articles before adding them to the closet/gallery.
// Features:
//   - Modular detection/cropping services for easy provider swaps (Clarifai, OpenAI, etc.)
//   - Bounding box overlays and selection UI
//   - Async image cropping and error handling
//   - Clean, modern UI with user feedback
//
// Designed for flexibility and robust user experience.
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { detectClothingArticles } from '../services/imageProcessingService';
import { IMAGE_PROCESSING_PROVIDER } from '../config/imageProvider';
import { processGarmentImage } from '../services/garmentVisionService';

// Optionally, import your OpenAI API key from env/config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Toggle this flag to enable/disable bounding box overlays
const BOUNDING_BOX_OVERLAY_ENABLED = true;

export default function VerificationScreen({ route, navigation }) {
  const { imageUri } = route.params;
  // Log only the type of imageUri for debugging, not the full string (avoid leaking base64 data)
  console.log('[VerificationScreen] imageUri param type:', typeof imageUri, imageUri && imageUri.startsWith('data:') ? '[base64]' : '[file path]');


  const [articles, setArticles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // Track confirmed articles

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function processImage() {
      // Log only the type of imageUri for debugging
      console.log('[VerificationScreen] processImage, imageUri type:', typeof imageUri, imageUri && imageUri.startsWith('data:') ? '[base64]' : '[file path]');
      if (!imageUri) return;
      setLoading(true);
      setError(null);
      try {
        let separated;
        if (IMAGE_PROCESSING_PROVIDER === 'garmentVision') {
          // If imageUri is already base64, skip manipulation
          let base64Image = null;
          if (imageUri.startsWith('data:')) {
            base64Image = imageUri.split(',')[1];
            // Skipped manipulation for base64 URI (already in correct format)
            console.log('[VerificationScreen] Skipped manipulation, using base64 from data URI.');
          } else {
            let manipResult;
            try {
              manipResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ resize: { width: 512, height: 512 } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
              );
              base64Image = manipResult.base64;
              // Manipulated image successfully; log only the file path
              console.log('[VerificationScreen] Manipulated image uri:', manipResult.uri);
            } catch (manipErr) {
              console.warn('[VerificationScreen] Image manipulation failed, falling back to original:', manipErr);
              // Try extracting base64 from original URI if possible
              if (imageUri.startsWith('data:')) {
                base64Image = imageUri.split(',')[1];
              }
            }
          }
          // Do not log base64 image data for privacy/security
          if (!base64Image) {
            setError('Could not extract base64 image data (required for GarmentVision pipeline).');
            setArticles([]);
            setSelectedIds([]);
            setLoading(false);
            return;
          }
          const result = await processGarmentImage(base64Image, { openaiApiKey: OPENAI_API_KEY });
          // Assign a globally unique UUID to each article
          const uuid = (await import('../services/uuid')).default;
          separated = (Array.isArray(result) ? result : [result]).map(article => ({
            ...article,
            id: uuid(),
          }));
        } else {
          separated = await detectClothingArticles(imageUri);
        }
        setArticles(separated);
        setSelectedIds([]); // Reset selection on new image
      } catch (err) {
        setError('Failed to process image (detection or conversion error). Please try again.');
        setArticles([]);
        setSelectedIds([]);
      } finally {
        setLoading(false);
      }
    }
    processImage();
  }, [imageUri]);

  // Confirm-only: Only send selected articles to gallery, cropping each article's region
  const onFinish = async () => {
    const confirmedArticles = articles.filter(a => selectedIds.includes(a.id));
    setLoading(true);
    try {
      let finalArticles;
      if (IMAGE_PROCESSING_PROVIDER === 'garmentVision') {
        // Map categories to app-standard using mapClarifaiLabelToCategory
        const { mapClarifaiLabelToCategory } = await import('../services/clarifaiCategoryMapper');
        finalArticles = articles
          .filter(a => selectedIds.includes(a.id))
          .map(article => ({
            ...article,
            category: mapClarifaiLabelToCategory(article.category)
          }));
        if (!finalArticles.length) throw new Error('No articles selected');
      } else {
        const croppedArticles = await import('../services/imageProcessingService').then(({ cropArticlesFromImage }) =>
          cropArticlesFromImage(imageUri, confirmedArticles)
        );
        // Cropped articles ready (for debugging, can remove or wrap in debug flag)

        // Ensure each article has a valid category before saving
        const { mapClarifaiLabelToCategory } = await import('../services/clarifaiCategoryMapper');
        const uuid = (await import('../services/uuid')).default;
        finalArticles = croppedArticles.map(article => ({
          ...article,
          id: uuid(), // assign a globally unique ID
          category: mapClarifaiLabelToCategory(article.name)
        }));
      }
      navigation.replace('Gallery', { newArticles: finalArticles });
    } catch (e) {
      console.error('[onFinish] Error:', e);
      setError('Failed to crop or process images.');
    } finally {
      setLoading(false);
    }
  };


  // Toggle selection for an article
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selId) => selId !== id) : [...prev, id]
    );
  };

  // Select all articles
  const selectAll = () => {
    setSelectedIds(articles.map(a => a.id));
  };

  // Deselect all articles
  const deselectAll = () => {
    setSelectedIds([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Items to Confirm</Text>
      {loading && <Text style={{marginVertical: 12, color: '#42a5f5'}}>Processing image...</Text>}
      {error && <Text style={{marginVertical: 12, color: 'red'}}>{error}</Text>}
      <View style={styles.selectAllBar}>
        <Text style={styles.selectedCount}>{selectedIds.length} selected</Text>
        <TouchableOpacity onPress={selectedIds.length === articles.length ? deselectAll : selectAll} style={styles.selectAllButton}>
          <Text style={styles.selectAllText}>
            {selectedIds.length === articles.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.card, selected && styles.selectedCard]}
              onPress={() => toggleSelect(item.id)}
              activeOpacity={0.8}
            >
              {/* Garment image or placeholder logic */}
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 8, backgroundColor: '#f1f1f1' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 8, backgroundColor: '#f1f1f1', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Use a built-in icon or a simple SVG/emoji as a placeholder */}
                  <Text style={{ fontSize: 36, color: '#bbb' }}>🧦</Text>
                  <Text style={{ color: '#bbb', fontSize: 13, marginTop: 4 }}>Image not available for this item.</Text>
                </View>
              )}
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{item.name}</Text>
              {/* Optionally show confidence if present */}
              {typeof item.confidence === 'number' && (
                <Text style={{ color: '#888', marginBottom: 4 }}>{(item.confidence * 100).toFixed(1)}%</Text>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.grid}
      />
      <TouchableOpacity
        style={[styles.confirmButton, selectedIds.length === 0 && styles.confirmButtonDisabled]}
        onPress={onFinish}
        disabled={selectedIds.length === 0}
      >
        <Text style={styles.confirmButtonText}>Finish ({selectedIds.length})</Text>
      </TouchableOpacity>
    </View>
  );
}

// Lightweight bounding box overlay component
function BoundingBoxOverlay({ boundingBox }) {
  // boundingBox values are normalized (0-1)
  // We'll use absolute positioning within a View of relative size
  // The parent View should have width: '100%', aspectRatio: 1
  if (!boundingBox) return null;
  const { top_row, left_col, bottom_row, right_col } = boundingBox;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${left_col * 100}%`,
        top: `${top_row * 100}%`,
        width: `${(right_col - left_col) * 100}%`,
        height: `${(bottom_row - top_row) * 100}%`,
        borderWidth: 2,
        borderColor: '#42a5f5',
        borderRadius: 4,
        backgroundColor: 'rgba(66, 165, 245, 0.08)',
      }}
    />
  );
}

const styles = StyleSheet.create({
  selectAllBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  selectAllButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    marginLeft: 16,
  },
  selectAllText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  selectedCount: {
    fontSize: 16,
    color: '#555',
    marginRight: 8,
  },
  confirmButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 48,
    backgroundColor: '#42a5f5',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#42a5f5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmButtonDisabled: {
    backgroundColor: '#bbdefb',
    borderColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#f6f8fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#22223b',
  },
  card: {
    margin: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    padding: 12,
    width: 150,
    minHeight: 200,
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#42a5f5', // Match Finish button
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  discardButtonWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#d11a2a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
});
