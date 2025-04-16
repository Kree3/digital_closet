// GalleryScreen.js
// Displays the user's confirmed clothing articles in a grid ("My Closet").
// Uses a modular data model and AsyncStorage for persistence.
// NOTE: If you change the detection/image provider, update how images are sourced (e.g., croppedImageUri).
// Designed for easy backend/image source swaps.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GALLERY_ARTICLES_KEY } from '../services/constants';
import CategoryCarousel from '../components/CategoryCarousel';

export default function GalleryScreen({ navigation, route }) {
  // Dev-only: Debug button to clear closet (gated by __DEV__)
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
      if (__DEV__) console.log('Closet cleared.');
    } catch (e) {
      if (__DEV__) console.error('Failed to clear closet:', e);
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
    if (route.params?.newArticles) {
      (async () => {
        try {
          const stored = await AsyncStorage.getItem(GALLERY_ARTICLES_KEY);
          const existing = stored ? JSON.parse(stored) : [];
          // Filter out any duplicates by id
          const existingIds = new Set(existing.map(a => a.id));
          const filteredNew = route.params.newArticles.filter(a => !existingIds.has(a.id));
          const combined = [...existing, ...filteredNew];
          setArticles(combined);
          await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(combined));
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
    if (__DEV__) console.log('Pressed article:', item);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Closet</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {__DEV__ && (
            <TouchableOpacity
              style={styles.debugIconButton}
              onPress={handleClearCloset}
              accessibilityLabel="Clear Closet (Debug)"
            >
              <Ionicons name="bug" size={32} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.homeIconButton}
            onPress={() => navigation.navigate('Home')}
            accessibilityLabel="Go to Home"
          >
            <Ionicons name="home" size={32} color="#42a5f5" />
          </TouchableOpacity>
        </View>
      </View>
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
    marginLeft: 12,
  },
  debugIconButton: {
    backgroundColor: '#f44336',
    borderRadius: 20,
    padding: 4,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
