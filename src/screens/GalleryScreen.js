// GalleryScreen.js
// Displays user's confirmed clothing articles in a grid
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
// Button import removed
import { Ionicons } from '@expo/vector-icons';
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
        // Optionally, you can use Alert.alert here for user feedback if desired
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
          // Optionally, you can use Alert.alert here for user feedback if desired
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
      // Optionally, you can use Alert.alert here for user feedback if desired
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

      <View style={styles.headerRow}>
        <Text style={styles.title}>My Closet</Text>
        <TouchableOpacity style={styles.homeIconButton} onPress={() => navigation.navigate('Home')} accessibilityLabel="Go to Home">
          <Ionicons name="home" size={32} color="#42a5f5" />
        </TouchableOpacity>
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
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.grid}
      />
      {selectedIds.length > 0 && (
        <TouchableOpacity style={styles.discardButton} onPress={discardSelected}>
          <Text style={styles.discardButtonText}>Discard ({selectedIds.length})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 72, // Increased space below the status bar for a cleaner look
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  homeIconButton: {
    padding: 4,
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
    borderWidth: 3,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  selectedCard: {
    borderColor: '#42a5f5', // Match Finish button and VerificationScreen
  },
  image: {
    width: 120,
    height: 140,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 8,
  },

  discardButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 48, // Move button up from bottom
    backgroundColor: '#f06292', // More red, but not harsh
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#f06292',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  discardButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18
  },
});
