// CategoryCarousel.js
// Renders a horizontal carousel of clothing articles for a given category (Netflix-style)
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../theme';
import ArticleCard from './common/ArticleCard';

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
            <ArticleCard
              article={item}
              variant="carousel"
              selectionMode={selectionMode}
              selected={selected}
              onPress={onItemPress}
              validateUrls={true}
              style={styles.card}
            />
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
    color: colors.textBlack,
  },
  carousel: {
    paddingHorizontal: 8,
  },
  card: {
    // Most styling now handled by ArticleCard component
  },
});
