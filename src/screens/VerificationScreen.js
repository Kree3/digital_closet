// VerificationScreen.js
//
// Verification Screen for Digital Closet
// -------------------------------------
// Allows users to confirm and select detected clothing articles before adding them to the closet/gallery.
// Features:
//   - Clean Architecture: UI only, all business logic in verificationService
//   - Bounding box overlays and selection UI
//   - Robust error handling and loading states
//   - Clean, modern UI with user feedback
//
// Designed for flexibility and robust user experience.
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { processImageForVerification, processSelectedArticles } from '../services/verificationService';

// Optionally, import your OpenAI API key from env/config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Toggle this flag to enable/disable bounding box overlays
const BOUNDING_BOX_OVERLAY_ENABLED = true;

export default function VerificationScreen({ route, navigation }) {
  const { imageUri } = route.params;
  // Log only the type of imageUri for debugging, not the full string (avoid leaking base64 data)
  console.log('[VerificationScreen] imageUri param type:', typeof imageUri, imageUri && imageUri.startsWith('data:') ? '[base64]' : '[file path]');
  
  // Screen state - following Clean Architecture, this component only manages UI state


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
      
      // Use the verificationService to process the image
      const { articles, error } = await processImageForVerification(imageUri, { 
        openaiApiKey: OPENAI_API_KEY 
      });
      
      if (error) {
        setError(error);
        setArticles([]);
        setSelectedIds([]);
      } else {
        setArticles(articles);
        setSelectedIds([]); // Reset selection on new image
      }
      
      setLoading(false);
    }
    
    processImage();
  }, [imageUri]);

  // Confirm-only: Only send selected articles to gallery, processing each article as needed
  const onFinish = async () => {
    setLoading(true);
    setError(null);
    
    // Use the verificationService to process selected articles
    const { finalArticles, error } = await processSelectedArticles(imageUri, articles, selectedIds);
    
    if (error) {
      console.error('[VerificationScreen] onFinish error:', error);
      setError(error);
      setLoading(false);
      return;
    }
    
    // Navigate to Gallery with the processed articles
    navigation.replace('Gallery', { newArticles: finalArticles });
    setLoading(false);
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
              {/* Garment image or placeholder logic - prioritize local images for persistence */}
              {item.localImageUri || item.imageUrl ? (
                <Image
                  source={{ uri: item.localImageUri || item.imageUrl }}
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
