// OutfitDetailScreen.js
// Displays details of a specific outfit and allows marking it as worn
// Features:
//   - Shows all articles in the outfit
//   - Provides a button to mark the outfit as worn
//   - Tracks wear count for articles
//   - Clean, modern UI consistent with app design

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { markOutfitAsWorn } from '../services/outfitService';
import { getAllArticles } from '../services/galleryService';

export default function OutfitDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { outfit } = route.params || {};
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAsWorn, setMarkingAsWorn] = useState(false);
  const [outfitDetails, setOutfitDetails] = useState(outfit);
  
  // Load the articles for this outfit
  useEffect(() => {
    async function loadArticles() {
      if (!outfit || !outfit.articleIds) {
        setLoading(false);
        return;
      }
      
      try {
        const allArticles = await getAllArticles();
        const outfitArticles = allArticles.filter(article => 
          outfit.articleIds.includes(article.id)
        );
        setArticles(outfitArticles);
      } catch (error) {
        console.error('[OutfitDetailScreen] Error loading articles:', error);
        Alert.alert('Error', 'Failed to load outfit articles.');
      } finally {
        setLoading(false);
      }
    }
    
    loadArticles();
  }, [outfit]);
  
  // Handle marking the outfit as worn
  const handleMarkAsWorn = async () => {
    if (!outfit || !outfit.id) return;
    
    setMarkingAsWorn(true);
    try {
      const result = await markOutfitAsWorn(outfit.id);
      
      if (result.success) {
        // Update the local state with the updated outfit
        if (result.outfit) {
          setOutfitDetails(result.outfit);
        }
        
        Alert.alert(
          'Outfit Marked as Worn',
          `You've worn this outfit ${result.outfit?.wearCount || 1} time${result.outfit?.wearCount !== 1 ? 's' : ''}. Wear counts for ${result.articlesUpdated} articles have been updated.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to mark outfit as worn.');
      }
    } catch (error) {
      console.error('[OutfitDetailScreen] Error marking outfit as worn:', error);
      Alert.alert('Error', 'Failed to mark outfit as worn.');
    } finally {
      setMarkingAsWorn(false);
    }
  };
  
  // Render an individual article
  const renderArticle = ({ item }) => {
    const imageUri = item.localImageUri || item.croppedImageUri || item.imageUri || item.imageUrl;
    const wearCount = typeof item.wearCount === 'number' ? item.wearCount : 0;
    
    return (
      <View style={styles.articleCard}>
        <Image 
          source={{ uri: imageUri }}
          style={styles.articleImage}
        />
        <View style={styles.articleInfo}>
          <Text style={styles.articleName}>{item.description || item.name || 'Article'}</Text>
          <Text style={styles.articleCategory}>{item.category || 'Uncategorized'}</Text>
          <View style={styles.wearCountContainer}>
            <Ionicons name="repeat" size={16} color="#757575" />
            <Text style={styles.wearCountText}>Worn {wearCount} time{wearCount !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never worn';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (!outfit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Outfit not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#42a5f5" />
        </TouchableOpacity>
        <Text style={styles.title}>{outfitDetails.name}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Articles</Text>
          <Text style={styles.statValue}>{outfitDetails.articleIds?.length || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Worn</Text>
          <Text style={styles.statValue}>{outfitDetails.wearCount || 0} times</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last Worn</Text>
          <Text style={styles.statValue}>{outfitDetails.lastWorn ? formatDate(outfitDetails.lastWorn) : 'Never'}</Text>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#42a5f5" />
          <Text style={styles.loadingText}>Loading articles...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Articles in this Outfit</Text>
          <FlatList
            data={articles}
            keyExtractor={(item) => item.id}
            renderItem={renderArticle}
            contentContainerStyle={styles.articlesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No articles found for this outfit.</Text>
              </View>
            }
          />
          
          <TouchableOpacity 
            style={styles.wearButton}
            onPress={handleMarkAsWorn}
            disabled={markingAsWorn}
          >
            {markingAsWorn ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.wearButtonIcon} />
                <Text style={styles.wearButtonText}>I Wore This Today</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  articlesList: {
    padding: 16,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  articleInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  articleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  articleCategory: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  wearCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wearCountText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 6,
  },
  wearButton: {
    backgroundColor: '#42a5f5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 16,
    elevation: 2,
  },
  wearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  wearButtonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#42a5f5',
    fontWeight: '600',
  },
});
