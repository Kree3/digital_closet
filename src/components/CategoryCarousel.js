// CategoryCarousel.js
// Renders a horizontal carousel of clothing articles for a given category (Netflix-style)
import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function CategoryCarousel({ category, articles, onItemPress }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.croppedImageUri || item.imageUri }} style={styles.image} />
          </TouchableOpacity>
        )}
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
  },
  image: {
    width: 110,
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
  },
});
