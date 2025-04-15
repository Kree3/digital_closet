// GalleryScreen.js
// Displays user's confirmed clothing articles in a grid
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GalleryScreen({ navigation, route }) {
  const [articles, setArticles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // Track selected articles


  // Load articles from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('galleryArticles');
        if (stored) setArticles(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load gallery articles:', e);
      }
    })();
  }, []);

  // Add new articles from VerificationScreen, then persist
  useEffect(() => {
    console.log('GalleryScreen useEffect triggered. route.params:', route.params);
    if (route.params?.newArticles) {
      console.log('GalleryScreen received newArticles:', route.params.newArticles);
      (async () => {
        try {
          const stored = await AsyncStorage.getItem('galleryArticles');
          const existing = stored ? JSON.parse(stored) : [];
          console.log('Existing galleryArticles from AsyncStorage:', existing);
          // Filter out any duplicates by id
          const existingIds = new Set(existing.map(a => a.id));
          const filteredNew = route.params.newArticles.filter(a => !existingIds.has(a.id));
          console.log('Filtered new articles (not in existing):', filteredNew);
          const combined = [...existing, ...filteredNew];
          console.log('Combined galleryArticles to be saved:', combined);
          setArticles(combined);
          await AsyncStorage.setItem('galleryArticles', JSON.stringify(combined));
          const afterSave = await AsyncStorage.getItem('galleryArticles');
          console.log('galleryArticles after save:', JSON.parse(afterSave));
        } catch (e) {
          console.warn('Failed to merge new articles into gallery:', e);
        }
      })();
    }
  }, [route.params]);

  // Save articles to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem('galleryArticles', JSON.stringify(articles));
  }, [articles]);

  // Multi-select discard: delete all selected articles
  const discardSelected = async () => {
    try {
      const updated = articles.filter((a) => !selectedIds.includes(a.id));
      setArticles(updated);
      await AsyncStorage.setItem('galleryArticles', JSON.stringify(updated));
      setSelectedIds([]); // Clear selection
    } catch (e) {
      console.warn('Failed to discard selected articles:', e);
    }
  };

  // Toggle selection for an article
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selId) => selId !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
      <View style={styles.headerWrap}>
        <Text style={styles.title}>My Closet</Text>
      </View>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
      {selectedIds.length > 0 && (
        <TouchableOpacity style={styles.discardButton} onPress={discardSelected}>
          <Text style={styles.discardButtonText}>🗑️ Discard ({selectedIds.length})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  grid: {
    padding: 12,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  card: {
    flex: 0.48, // Ensures two cards per row with spacing
    margin: 4,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#e6f0ff',
  },
  image: {
    width: 150,
    height: 180,
    resizeMode: 'cover',
    borderRadius: 14,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,122,255,0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  selectedCheck: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  discardButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#ff3b30',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  discardButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
