// CategoryCarousel.js
// Renders a horizontal carousel of clothing articles for a given category (Netflix-style)
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { validateImageUrl } from '../services/urlValidationService';

export default function CategoryCarousel({ category, articles, onItemPress, selectionMode = false, selectedIds = [] }) {
  // Function to check if an article's image URL is expired
  const checkImageUrlStatus = (item) => {
    // Prioritize local image URI for persistence
    const imageUrl = item.localImageUri || item.croppedImageUri || item.imageUri || item.imageUrl;
    if (!imageUrl) return { valid: false, message: 'No image available' };
    
    // Only validate remote URLs (those that start with http or https)
    if (imageUrl.startsWith('http')) {
      return validateImageUrl(imageUrl);
    }
    
    // Local images are always valid
    return { valid: true, expired: false, message: 'Local image' };
  };
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const selected = selectionMode && selectedIds.includes(item.id);
          const imageStatus = checkImageUrlStatus(item);
          const imageUrl = item.localImageUri || item.croppedImageUri || item.imageUri || item.imageUrl;
          
          return (
            <TouchableOpacity
              style={[styles.card, selected && styles.selectedCard]}
              onPress={() => onItemPress?.(item)}
              activeOpacity={0.8}
            >
              {imageStatus.valid ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.expiredImageContainer}>
                  {imageStatus.expired ? (
                    <>
                      <Ionicons name="refresh-circle" size={32} color="#42a5f5" />
                      <Text style={styles.expiredText}>Refresh Needed</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={32} color="#888" />
                      <Text style={styles.expiredText}>No Image</Text>
                    </>
                  )}
                </View>
              )}
              
              {selected && (
                <View style={[styles.selectionOverlay, styles.selectedOverlay]}>
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.carousel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 6,
    color: '#222',
  },
  carousel: {
    paddingHorizontal: 8,
  },
  card: {
    width: 120,
    height: 160,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#42a5f5',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(66, 165, 245, 0.13)',
    borderRadius: 12,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 7,
  },
  selectedOverlay: {
    backgroundColor: 'rgba(66, 165, 245, 0.23)',
  },
  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#42a5f5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.17,
    shadowRadius: 2,
  },
  image: {
    width: 110,
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  // Styles for expired image container
  expiredImageContainer: {
    width: 110,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  expiredText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
    fontWeight: '500',
  },
});
