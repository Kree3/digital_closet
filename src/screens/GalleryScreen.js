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
import { Alert } from 'react-native';

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
    if (selectedIds.length === 0) return;
    Alert.alert(
      'Delete Selected',
      `Are you sure you want to delete ${selectedIds.length} article(s) from your closet? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              const updated = articles.filter((a) => !selectedIds.includes(a.id));
              setArticles(updated);
              await AsyncStorage.setItem(GALLERY_ARTICLES_KEY, JSON.stringify(updated));
              setSelectedIds([]); // Clear selection
            } catch (e) {
              Alert.alert('Error', 'Failed to delete selected articles.');
            }
          }
        }
      ]
    );
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




  // Group articles by category
  const categories = ['outerwear', 'tops', 'bottoms', 'shoes'];
  const articlesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = articles.filter(a => a.category === cat);
    return acc;
  }, {});

  // Handle item press: toggle selection; if none selected, revert to normal mode
  const handleArticlePress = (item) => {
    toggleSelect(item.id);
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {categories.map((cat) =>
          articlesByCategory[cat] && articlesByCategory[cat].length > 0 ? (
            <CategoryCarousel
              key={cat}
              category={cat}
              articles={articlesByCategory[cat]}
              onItemPress={handleArticlePress}
              selectionMode={selectedIds.length > 0}
              selectedIds={selectedIds}
            />
          ) : null
        )}
      </ScrollView>
      {/* Floating bottom action bar for selection actions */}
      {selectedIds.length > 0 && (
        <View style={styles.fabBar}>
          {/* Left: Deselect All + # selected */}
          <TouchableOpacity
            style={styles.deselectAllButton}
            onPress={deselectAll}
            accessibilityLabel="Deselect all selected articles"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle-outline" size={22} color="#888" />
          </TouchableOpacity>
          {/* Colored number for selected count */}
          <Text
            style={styles.selectedCountNumber}
            accessibilityLabel={`${selectedIds.length} items selected`}
            accessible={true}
          >
            {selectedIds.length}
          </Text>

          {/* Center: + Create Fit */}
          <TouchableOpacity
            style={styles.createFitButton}
            onPress={() => {
              const selectedArticles = articles.filter(a => selectedIds.includes(a.id));
              navigation.navigate('CreateOutfit', { selectedArticles });
            }}
            accessibilityLabel="Create Fit from selected articles"
          >
            <Ionicons name="add-circle" size={24} color="#42a5f5" style={{ marginRight: 6 }} />
            <Text style={styles.createFitText}>Create Fit</Text>
          </TouchableOpacity>

          {/* Right: Trash icon only */}
          <TouchableOpacity
            style={[styles.deleteButton, selectedIds.length === 0 && styles.deleteButtonDisabled]}
            onPress={discardSelected}
            disabled={selectedIds.length === 0}
            accessibilityLabel="Delete selected articles"
          >
            <Ionicons name="trash" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
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
  selectAllBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  selectedCount: {
    // No longer used, replaced by badge
  },
  selectedBadge: {
    // Removed, replaced by colored number
  },
  selectedBadgeText: {
    // Removed, replaced by colored number
  },
  selectedCountNumber: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 12,
    marginLeft: 2,
    textAlign: 'center',
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    marginRight: 10,
  },
  selectAllText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButtonDisabled: {
    backgroundColor: '#ddd',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  fabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24, // Not too close to the bottom for easy tapping
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  createFitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    elevation: 2,
  },
  createFitText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deselectAllButton: {
    marginRight: 6,
    padding: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
