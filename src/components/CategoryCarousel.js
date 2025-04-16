// CategoryCarousel.js
// Renders a horizontal carousel of clothing articles for a given category (Netflix-style)
import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

export default function CategoryCarousel({ category, articles, onItemPress, selectionMode = false, selectedIds = [] }) {
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
          return (
            <TouchableOpacity
              style={[styles.card, selected && styles.selectedCard]}
              onPress={() => onItemPress?.(item)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.croppedImageUri || item.imageUri }} style={styles.image} />
              {selectionMode && (
                <View style={[styles.selectionOverlay, selected && styles.selectedOverlay]}>
                  {selected && (
                    <View style={styles.checkmarkCircle}>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </View>
                  )}
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
});
