// VerificationScreen.js
// Displays detected clothing articles for user confirmation and selection before adding to the closet/gallery.
// Relies on modular detection/cropping services; easy to swap Clarifai/OpenAI 4o or adjust cropping logic.
// TODO: When switching detection providers (e.g., OpenAI 4o), update detectClothingArticles in imageProcessingService.js and adjust cropping as needed.
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { detectClothingArticles } from '../services/imageProcessingService';

// Toggle this flag to enable/disable bounding box overlays
const BOUNDING_BOX_OVERLAY_ENABLED = true;

export default function VerificationScreen({ route, navigation }) {
  // Get the image URI passed from HomeScreen (user just took or uploaded a photo)
  const { imageUri } = route.params;

  // Simulate clothing detection by splitting the image into 'articles'.
  // This uses a mock function for now, but will be replaced with a real API later.
  const [articles, setArticles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // Track confirmed articles

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function processImage() {
      if (!imageUri) return;
      setLoading(true);
      setError(null);
      try {
        const separated = await detectClothingArticles(imageUri);
        console.log('Clothing articles returned:', separated);
        setArticles(separated);
        setSelectedIds([]); // Reset selection on new image
      } catch (err) {
        setError('Failed to process image. Please try again.');
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
      // Dynamically import ImageManipulator
      const { manipulateAsync } = await import('expo-image-manipulator');
      // Get image size (needed to convert normalized bounding box to pixels)
      const getImageSize = uri => new Promise((resolve, reject) => {
        Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
      });
      const { width: imgW, height: imgH } = await getImageSize(imageUri);
      const croppedArticles = await Promise.all(confirmedArticles.map(async (article) => {
        if (!article.boundingBox) return article;
        const { left_col, top_row, right_col, bottom_row } = article.boundingBox;
        const crop = {
          originX: Math.round(left_col * imgW),
          originY: Math.round(top_row * imgH),
          width: Math.round((right_col - left_col) * imgW),
          height: Math.round((bottom_row - top_row) * imgH),
        };
        // Ensure crop dimensions are valid
        if (crop.width <= 0 || crop.height <= 0) return article;
        try {
          const result = await manipulateAsync(
            imageUri,
            [{ crop }],
            { compress: 1, format: 'jpeg' }
          );
          return { ...article, croppedImageUri: result.uri };
        } catch (e) {
          return article;
        }
      }));
      navigation.replace('Gallery', { newArticles: croppedArticles });
    } catch (e) {
      setError('Failed to crop images.');
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
              {/* Show the original image with bounding box overlay if enabled and imageUri is available */}
              {BOUNDING_BOX_OVERLAY_ENABLED && imageUri && item.boundingBox ? (
                <View style={{ width: '100%', aspectRatio: 1, marginBottom: 8 }}>
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    resizeMode="cover"
                  />
                  <BoundingBoxOverlay boundingBox={item.boundingBox} />
                </View>
              ) : null}
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{item.name}</Text>
              <Text style={{ color: '#888', marginBottom: 4 }}>{(item.confidence * 100).toFixed(1)}%</Text>
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
