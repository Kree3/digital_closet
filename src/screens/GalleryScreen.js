// GalleryScreen.js
// Displays user's confirmed clothing articles in a grid ("My Closet").
// Relies on modular data model and AsyncStorage for persistence.
// TODO: If detection/image provider changes, update how images are sourced (croppedImageUri, etc.).
// Designed for easy backend/image source swaps.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GALLERY_ARTICLES_KEY } from '../services/constants';
import CategoryCarousel from '../components/CategoryCarousel';

export default function GalleryScreen({ navigation, route }) {
  // TEMP: Debug button to clear closet
  const handleClearCloset = async () => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('Are you sure you want to clear your entire closet? This cannot be undone.')) return;
    } else if (!global.confirm || global.confirm('Are you sure you want to clear your entire closet? This cannot be undone.')) {
      // fallback for React Native: always proceed
    }
    try {
      await AsyncStorage.removeItem(GALLERY_ARTICLES_KEY);
      setArticles([]);
      setSelectedIds([]);
      console.log('Closet cleared.');
    } catch (e) {
      console.error('Failed to clear closet:', e);
    }
  };

  const [articles, setArticles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // Track selected articles


  // Load articles from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
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
          const stored = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
          const existing = stored ? JSON.parse(stored) : [];
          console.log('Existing galleryArticles from AsyncStorage:', existing);
          // Filter out any duplicates by id
          const existingIds = new Set(existing.map(a => a.id));
          const filteredNew = route.params.newArticles.filter(a => !existingIds.has(a.id));
          console.log('Filtered new articles (not in existing):', filteredNew);
          const combined = [...existing, ...filteredNew];
          console.log('Combined galleryArticles to be saved:', combined);
          setArticles(combined);
          await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(combined));
          const afterSave = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
          console.log('galleryArticles after save:', JSON.parse(afterSave));
        } catch (e) {
          // Optionally, you can use Alert.alert here for user feedback if desired
        }
      })();
    }
  }, [route.params]);

  // Save articles to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(articles));
  }, [articles]);

  // Multi-select discard: delete all selected articles
  const discardSelected = async () => {
    try {
      const updated = articles.filter((a) => !selectedIds.includes(a.id));
      setArticles(updated);
      await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(updated));
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

  // DEBUG: Log loaded articles and their categories
  console.log('GalleryScreen loaded articles:', articles);
  if (articles.length > 0) {
    articles.forEach((a, idx) => console.log(`Article[${idx}]: id=${a.id}, category=${a.category}`));
  }

  // Group articles by category
  const categories = ['outerwear', 'tops', 'bottoms', 'shoes'];
  const articlesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = articles.filter(a => a.category === cat);
    return acc;
  }, {});

  // Placeholder for item press handler
  const handleArticlePress = (item) => {
    // In the future: navigate to detail, enlarge, etc.
    // For now, just log
    console.log('Pressed article:', item);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Closet</Text>
        <TouchableOpacity
          style={styles.homeIconButton}
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Go to Home"
        >
          <Ionicons name="home" size={32} color="#42a5f5" />
        </TouchableOpacity>
      </View>
      {/* TEMP: Debug clear closet button */}
      <TouchableOpacity
        style={{backgroundColor: '#f44336', padding: 10, margin: 16, borderRadius: 6, alignSelf: 'center'}} 
        onPress={handleClearCloset}
        accessibilityLabel="Clear Closet"
      >
        <Text style={{color: '#fff', fontWeight: 'bold'}}>Clear Closet (Debug)</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {categories.map((cat) =>
          articlesByCategory[cat] && articlesByCategory[cat].length > 0 ? (
            <CategoryCarousel
              key={cat}
              category={cat}
              articles={articlesByCategory[cat]}
              onItemPress={handleArticlePress}
            />
          ) : null
        )}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 24,
  },
});
