// GalleryScreen.js
//
// Wardrobe Screen for Digital Closet
// --------------------------------
// Displays the user's confirmed clothing articles in a grid ("My Wardrobe").
// Features:
//   - Modular data model and AsyncStorage persistence
//   - Category carousel and grid layout for articles
//   - Clean, modern UI with easy backend/image source swaps
//   - Robust error handling and user feedback
//
// Designed for extensibility and a polished user experience.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllArticles, addArticles, deleteArticlesById, clearAllArticles } from '../services/galleryService';
import CategoryCarousel from '../components/CategoryCarousel';
import { Alert } from 'react-native';
import { colors, shadows } from '../theme';
import AppHeader from '../components/common/AppHeader';

import { useFocusEffect } from '@react-navigation/native';

export default function GalleryScreen({ navigation, route }) {
  // Developer utility: Clear closet button
  const handleClearCloset = async () => {
    try {
      await clearAllArticles();
      setArticles([]);
      setSelectedIds([]);
    } catch (e) {
      console.error('[GalleryScreen] Error clearing closet:', e);
      Alert.alert('Error', 'Failed to clear closet.');
    }
  };

  // Handle route parameters for selection management
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.resetSelection) {
        setSelectedIds([]);
        setIsSelectionMode(false);
        // Clear the param so it doesn't trigger again
        navigation.setParams({ resetSelection: undefined });
      }
      
      // Enter selection mode if requested (from OutfitsScreen "Create Outfit")
      if (route.params?.selectMode) {
        // Show selection UI by setting selection mode to true
        setIsSelectionMode(true);
        // Clear the param so it doesn't trigger again
        navigation.setParams({ selectMode: undefined });
      }
    }, [route.params?.resetSelection, route.params?.selectMode])
  );

  const [articles, setArticles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // Track selected articles
  const [isSelectionMode, setIsSelectionMode] = useState(false); // Track if in selection mode


  // Load articles from galleryService on mount
  useEffect(() => {
    (async () => {
      const loaded = await getAllArticles();
      setArticles(loaded);
    })();
  }, []);

  // Add new articles from VerificationScreen, then persist via service
  useEffect(() => {
    if (route.params?.newArticles) {
      (async () => {
        // Received new articles from VerificationScreen
        const combined = await addArticles(route.params.newArticles);
        setArticles(combined);
      })();
    }
  }, [route.params]);



  // Multi-select discard: delete all selected articles via service
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
              const updated = await deleteArticlesById(selectedIds);
              setArticles(updated);
              setSelectedIds([]); // Clear selection
              setIsSelectionMode(false); // Exit selection mode
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
    setSelectedIds((prev) => {
      const newSelection = prev.includes(id) ? prev.filter((selId) => selId !== id) : [...prev, id];
      
      // Auto-enable selection mode when first item is selected
      if (newSelection.length > 0 && !isSelectionMode) {
        setIsSelectionMode(true);
      }
      // Auto-disable selection mode when no items selected (unless enforced by route param)
      else if (newSelection.length === 0 && isSelectionMode) {
        setIsSelectionMode(false);
      }
      
      return newSelection;
    });
  };

  // Select all articles
  const selectAll = () => {
    setSelectedIds(articles.map(a => a.id));
    setIsSelectionMode(true);
  };
  
  // Deselect all articles
  const deselectAll = () => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  };




  // Group articles by category
  // Categories are hardcoded for now; update if your data model changes
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
      <AppHeader 
        title="My Wardrobe"
        variant="main"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {categories.map((cat) =>
          articlesByCategory[cat] && articlesByCategory[cat].length > 0 ? (
            <CategoryCarousel
              key={cat}
              category={cat}
              articles={articlesByCategory[cat]}
              onItemPress={handleArticlePress}
              selectionMode={isSelectionMode || selectedIds.length > 0}
              selectedIds={selectedIds}
            />
          ) : null
        )}
      </ScrollView>
      {/* Floating bottom action bar for selection actions */}
      {(isSelectionMode || selectedIds.length > 0) && (
        <View style={styles.fabBar}>
          {/* Left: Deselect All + # selected */}
          <TouchableOpacity
            style={styles.deselectAllButton}
            onPress={deselectAll}
            accessibilityLabel="Deselect all selected articles"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle-outline" size={22} color={colors.gray500} />
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
              
              // Prevent navigation if no articles are selected
              if (selectedArticles.length === 0) {
                Alert.alert(
                  'No Articles Selected',
                  'Please select at least one article to create an outfit.',
                  [{ text: 'OK' }]
                );
                return;
              }
              
              navigation.navigate('CreateOutfit', { selectedArticles });
            }}
            accessibilityLabel="Create Fit from selected articles"
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.createFitText}>Create Fit</Text>
          </TouchableOpacity>

          {/* Right: Trash icon only */}
          <TouchableOpacity
            style={[styles.deleteButton, selectedIds.length === 0 && styles.deleteButtonDisabled]}
            onPress={discardSelected}
            disabled={selectedIds.length === 0}
            accessibilityLabel="Delete selected articles"
          >
            <Ionicons name="trash" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    backgroundColor: colors.errorAlt,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeholderContainer: {
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    width: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderText: {
    color: colors.gray500,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 20,
  },
  homeIconButton: {
    padding: 4,
    marginLeft: 12,
  },
  debugIconButton: {
    backgroundColor: colors.error,
    borderRadius: 20,
    padding: 4,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.primaryDark,
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
    backgroundColor: colors.backgroundTertiary,
    marginRight: 10,
  },
  selectAllText: {
    fontSize: 14,
    color: colors.textBlack,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButtonDisabled: {
    backgroundColor: colors.borderDark,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  scrollContent: {
    paddingBottom: 90, // Increased to prevent last row from being covered by select bar
  },
  fabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 40, // Raised for comfortable touch per mobile UX standards
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...shadows.medium,
    zIndex: 100,
  },
  createFitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    elevation: 2,
  },
  createFitText: {
    color: colors.primaryDark,
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
