// VerificationScreen.js
// Shows separated clothing articles for confirmation/discard
// Bridge between taking and uploading a photo and adding them into your gallery. 
// This is where the app simulates "detecting" clothing items and letting the user confirm or discard them.
import React, { useState } from 'react';
import { View, FlatList, Image, Button, StyleSheet, Text } from 'react-native';
import { mockSeparateClothingItems } from '../services/mockImageProcessingService';

export default function VerificationScreen({ route, navigation }) {
  // Get the image URI passed from HomeScreen (user just took or uploaded a photo)
  const { imageUri } = route.params;

  // Simulate clothing detection by splitting the image into 'articles'.
  // This uses a mock function for now, but will be replaced with a real API later.
  const [articles, setArticles] = useState(mockSeparateClothingItems(imageUri));

  // Mark an article as confirmed (user wants to keep this item in their closet)
  const confirmArticle = (article_id) => {
    setArticles(prev => prev.map(a => a.id === article_id ? { ...a, confirmed: true } : a));
  };

  // Remove an article from the list (user discarded this item)
  const discardArticle = (article_id) => {
    setArticles(prev => prev.filter(a => a.id !== article_id));
  };

  // When the user is done, navigate to the Gallery screen,
  // passing only the articles that were confirmed
  const onFinish = () => {
    navigation.navigate('Gallery', { newArticles: articles.filter(a => a.confirmed) });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Clothing Articles</Text>
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <View style={styles.buttonRow}>
              <Button title="Confirm" onPress={() => confirmArticle(item.id)} color={item.confirmed ? 'green' : undefined} />
              <Button title="Discard" onPress={() => discardArticle(item.id)} color="red" />
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        numColumns={2} // Show 2 items per row; adjust as needed
        contentContainerStyle={styles.grid}
      />
      <Button title="Finish" onPress={onFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { margin: 10, alignItems: 'center' },
  image: { width: 120, height: 120, borderRadius: 8, marginBottom: 8 },
  buttonRow: { flexDirection: 'row', gap: 8 },
});
