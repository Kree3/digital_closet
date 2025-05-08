// OutfitsScreen.js
// Displays the user's saved outfits in a modern grid layout
// Features:
//   - Fetches and displays all saved outfits
//   - Allows viewing outfit details
//   - Supports deleting outfits
//   - Empty state with prompt to create first outfit
//   - Pull-to-refresh functionality
//   - Clean, modern UI consistent with app design

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  RefreshControl,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getOutfits, removeOutfit } from '../services/outfitService';
import { getAllArticles } from '../services/galleryService';

export default function OutfitsScreen() {
  console.log('[OutfitsScreen] Component mounted');
  const navigation = useNavigation();
  const [outfits, setOutfits] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load outfits and articles when screen is focused and when mounted
  useEffect(() => {
    loadData();
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {};
    }, [])
  );
  
  // Load outfits and all articles (needed to display outfit previews)
  const loadData = async () => {
    try {
      setLoading(true);
      const [outfitsData, articlesData] = await Promise.all([
        getOutfits(),
        getAllArticles()
      ]);
      console.log('[OutfitsScreen] Loaded outfits:', outfitsData.length);
      console.log('[OutfitsScreen] Loaded articles:', articlesData.length);
      setOutfits(outfitsData);
      setArticles(articlesData);
    } catch (error) {
      console.error('[OutfitsScreen] Error loading data:', error);
      Alert.alert('Error', 'Failed to load outfits. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Delete an outfit after confirmation
  const handleDeleteOutfit = (outfit) => {
    Alert.alert(
      'Delete Outfit',
      `Are you sure you want to delete "${outfit.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeOutfit(outfit.id);
              // Update the local state to remove the deleted outfit
              setOutfits(outfits.filter(o => o.id !== outfit.id));
            } catch (error) {
              console.error('[OutfitsScreen] Error deleting outfit:', error);
              Alert.alert('Error', 'Failed to delete outfit. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  // Get article objects for an outfit
  const getOutfitArticles = (outfit) => {
    if (!outfit || !outfit.articleIds || !Array.isArray(outfit.articleIds)) return [];
    return outfit.articleIds
      .map(id => articles.find(article => article.id === id))
      .filter(article => article !== undefined);
  };
  
  // Get preview images for an outfit (up to 4) in a standardized order by category
  const getOutfitPreviewImages = (outfit) => {
    const outfitArticles = getOutfitArticles(outfit);
    
    // Define category priority order (this determines display order)
    const categoryOrder = ['tops', 'outerwear', 'bottoms', 'shoes', 'accessory'];
    
    // Sort articles by category priority
    const sortedArticles = [...outfitArticles].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category) !== -1 ? categoryOrder.indexOf(a.category) : 999;
      const bIndex = categoryOrder.indexOf(b.category) !== -1 ? categoryOrder.indexOf(b.category) : 999;
      return aIndex - bIndex;
    });
    
    // Return image URIs in the sorted order (up to 4)
    return sortedArticles.slice(0, 4).map(article => {
      return article.localImageUri || article.croppedImageUri || article.imageUri || article.imageUrl;
    });
  };
  
  // Navigate to create a new outfit
  const navigateToCreateOutfit = () => {
    console.log('[OutfitsScreen] Navigating to create outfit');
    navigation.navigate('Gallery', { selectMode: true });
  };
  
  // Render empty state when no outfits exist
  const renderEmptyState = () => {
    console.log('[OutfitsScreen] Rendering empty state, loading:', loading);
    
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#42a5f5" />
          <Text style={styles.emptyText}>Loading outfits...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="shirt-outline" size={64} color="#b0bec5" />
        <Text style={styles.emptyTitle}>No Outfits Yet</Text>
        <Text style={styles.emptyText}>
          Create your first outfit by selecting items from your closet.
        </Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={navigateToCreateOutfit}
        >
          <Text style={styles.createButtonText}>Create Outfit</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render an individual outfit card
  const renderOutfitCard = ({ item: outfit }) => {
    const previewImages = getOutfitPreviewImages(outfit);
    const articleCount = outfit.articleIds ? outfit.articleIds.length : 0;
    
    return (
      <TouchableOpacity 
        style={styles.outfitCard}
        onPress={() => {
          // Navigate to the outfit detail screen
          navigation.navigate('OutfitDetail', { outfit });
        }}
      >
        <View style={styles.previewGrid}>
          {previewImages.length > 0 ? (
            previewImages.map((uri, index) => (
              <Image 
                key={`${outfit.id}-preview-${index}`}
                source={{ uri }}
                style={[
                  styles.previewImage,
                  previewImages.length === 1 && styles.singlePreviewImage,
                  previewImages.length === 3 && index === 0 && styles.largePreviewImage
                ]}
              />
            ))
          ) : (
            <View style={styles.noPreviewContainer}>
              <Ionicons name="images-outline" size={32} color="#b0bec5" />
            </View>
          )}
        </View>
        
        <View style={styles.outfitInfo}>
          <Text style={styles.outfitName} numberOfLines={1}>{outfit.name}</Text>
          <Text style={styles.outfitMeta}>{articleCount} items</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteOutfit(outfit)}
        >
          <Ionicons name="trash-outline" size={18} color="#f44336" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Outfits</Text>
      </View>
      
      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        renderItem={renderOutfitCard}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={outfits.length === 0 ? { flex: 1 } : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#42a5f5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  list: {
    padding: 16,
  },
  outfitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  previewImage: {
    width: '50%',
    height: '50%',
    resizeMode: 'cover',
  },
  singlePreviewImage: {
    width: '100%',
    height: '100%',
  },
  largePreviewImage: {
    width: '100%',
    height: '50%',
  },
  noPreviewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  outfitInfo: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  outfitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    letterSpacing: 0.2,
  },
  outfitMeta: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    padding: 8,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#424242',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#42a5f5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
