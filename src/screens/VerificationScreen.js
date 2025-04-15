// VerificationScreen.js
// Shows separated clothing articles for confirmation/discard
// Bridge between taking and uploading a photo and adding them into your gallery. 
// This is where the app simulates "detecting" clothing items and letting the user confirm or discard them.
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { mockSeparateClothingItems } from '../services/mockImageProcessingService';

export default function VerificationScreen({ route, navigation }) {
  // Get the image URI passed from HomeScreen (user just took or uploaded a photo)
  const { imageUri } = route.params;

  // Simulate clothing detection by splitting the image into 'articles'.
  // This uses a mock function for now, but will be replaced with a real API later.
  const [articles, setArticles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // Track confirmed articles

  useEffect(() => {
    if (imageUri) {
      const separated = mockSeparateClothingItems(imageUri);
      setArticles(separated);
      setSelectedIds([]); // Reset selection on new image
    }
  }, [imageUri]);

  // Confirm-only: Only send selected articles to gallery
  const onFinish = () => {
    const confirmedArticles = articles.filter(a => selectedIds.includes(a.id));
    navigation.replace('Gallery', { newArticles: confirmedArticles });
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
      <View style={styles.selectAllBar}>
        <TouchableOpacity onPress={selectedIds.length === articles.length ? deselectAll : selectAll} style={styles.selectAllButton}>
          <Text style={styles.selectAllText}>
            {selectedIds.length === articles.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.selectedCount}>{selectedIds.length} selected</Text>
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
              <Image source={{ uri: item.imageUri }} style={styles.image} />
              {selected && (
                <View style={styles.selectedOverlay}>
                  <Text style={styles.selectedCheck}>✓</Text>
                </View>
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

const styles = StyleSheet.create({
  selectAllBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 6,
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#e6f0ff',
  },
  selectAllText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  selectedCount: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#b0c4de',
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#3b82f6', // blue highlight
    shadowColor: '#3b82f6',
    shadowOpacity: 0.30,
    elevation: 8,
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
