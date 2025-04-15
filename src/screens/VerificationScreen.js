// VerificationScreen.js
// Shows separated clothing articles for confirmation and lets user select which to add to gallery.
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
              <Image source={{ uri: item.imageUri }} style={styles.image} />

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
