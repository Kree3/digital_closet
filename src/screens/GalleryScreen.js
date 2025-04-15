// GalleryScreen.js
// Displays user's confirmed clothing articles in a grid
import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, StyleSheet, Text, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GalleryScreen({ navigation, route }) {
  // For now, just show newly confirmed articles from VerificationScreen
  const [articles, setArticles] = useState([]);

  // Load articles from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('galleryArticles');
        if (stored) setArticles(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load gallery articles:', e);
      }
    })();
  }, []);

  // Add new articles from VerificationScreen, then persist
  useEffect(() => {
    if (route.params?.newArticles) {
      setArticles(prev => {
        const combined = [...prev, ...route.params.newArticles];
        AsyncStorage.setItem('galleryArticles', JSON.stringify(combined));
        return combined;
      });
    }
  }, [route.params]);

  // Save articles to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem('galleryArticles', JSON.stringify(articles));
  }, [articles]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Closet</Text>
      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <Button title="🗑️ Delete" color="#d11a2a" onPress={() => {
              Alert.alert('Delete', 'Remove this item from your closet?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {
                  setArticles(prev => prev.filter(a => a.id !== item.id));
                }}
              ]);
            }} />
          </View>
        )}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  grid: { alignItems: 'center' },
  card: { alignItems: 'center', margin: 6 },
  image: { width: 90, height: 90, marginBottom: 4, borderRadius: 8 },
});
