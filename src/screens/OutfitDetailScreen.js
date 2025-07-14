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
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { markOutfitAsWorn } from '../services/outfitService';
import { getAllArticles } from '../services/galleryService';
import { colors, shadows } from '../theme';
import AppHeader from '../components/common/AppHeader';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ArticleCard from '../components/common/ArticleCard';

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
    return (
      <ArticleCard
        article={item}
        variant="list"
        showName={true}
        showCategory={true}
        showWearCount={true}
      />
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
        <EmptyState
          error={true}
          title="Outfit not found"
          actionText="Go Back"
          onActionPress={() => navigation.goBack()}
          actionVariant="secondary"
          variant="fullscreen"
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={outfitDetails.name}
        showBackButton={true}
        variant="navigation"
        showBorder={true}
      />
      
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
        <EmptyState
          loading={true}
          loadingText="Loading articles..."
          variant="fullscreen"
        />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Articles in this Outfit</Text>
          <FlatList
            data={articles}
            keyExtractor={(item) => item.id}
            renderItem={renderArticle}
            contentContainerStyle={styles.articlesList}
            ListEmptyComponent={
              <EmptyState
                message="No articles found for this outfit."
                variant="inline"
              />
            }
          />
          
          <Button
            title="I Wore This Today"
            onPress={handleMarkAsWorn}
            disabled={markingAsWorn}
            loading={markingAsWorn}
            variant="primary"
            icon="checkmark-circle"
            iconPosition="left"
            style={styles.wearButton}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: colors.gray100,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  articlesList: {
    padding: 16,
  },
  wearButton: {
    margin: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
