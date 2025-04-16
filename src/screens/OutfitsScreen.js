// OutfitsScreen.js
// Displays the user's saved outfits in a bento grid (placeholder for now)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OutfitsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Outfits</Text>
      <Text style={styles.placeholder}>Your saved outfits will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#888',
  },
});
