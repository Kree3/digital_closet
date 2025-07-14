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
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { processImageForVerification, processSelectedArticles } from '../services/verificationService';
import { colors, shadows } from '../theme';
import Button from '../components/common/Button';
import ArticleCard from '../components/common/ArticleCard';

// Import OpenAI API key from environment variables
import { OPENAI_API_KEY } from '@env';

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
    
    // Navigate to Wardrobe tab with the processed articles
    navigation.navigate('Wardrobe', { 
      screen: 'WardrobeScreen',
      params: { newArticles: finalArticles } 
    });
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
      {loading && <Text style={{marginVertical: 12, color: colors.primary}}>Processing image...</Text>}
      {error && <Text style={{marginVertical: 12, color: colors.error}}>{error}</Text>}
      <View style={styles.selectAllBar}>
        <Text style={styles.selectedCount}>{selectedIds.length} selected</Text>
        <Button
          title={selectedIds.length === articles.length ? 'Deselect All' : 'Select All'}
          onPress={selectedIds.length === articles.length ? deselectAll : selectAll}
          variant="secondary"
          size="small"
        />
      </View>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.id);
          return (
            <ArticleCard
              article={item}
              variant="verification"
              showName={true}
              showConfidence={true}
              selectionMode={true}
              selected={selected}
              onSelect={toggleSelect}
              style={[styles.card, selected && styles.selectedCard]}
            />
          );
        }}
        contentContainerStyle={styles.grid}
      />
      <Button
        title={`Finish (${selectedIds.length})`}
        onPress={onFinish}
        disabled={selectedIds.length === 0}
        loading={loading}
        variant="primary"
        style={styles.confirmButton}
      />
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
        borderColor: colors.primary,
        borderRadius: 4,
        backgroundColor: colors.primaryAlpha,
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
  selectedCount: {
    fontSize: 16,
    color: colors.gray700,
    marginRight: 8,
  },
  confirmButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.medium,
    borderWidth: 2,
    borderColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: colors.backgroundCard,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.textDark,
  },
  card: {
    margin: 10,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    ...shadows.medium,
    padding: 12,
    width: 150,
    minHeight: 200,
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.transparent,
  },
  selectedCard: {
    borderColor: colors.primary, // Match Finish button
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  discardButtonWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: colors.errorDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
});
