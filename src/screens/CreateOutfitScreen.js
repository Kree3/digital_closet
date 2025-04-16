// CreateOutfitScreen.js
//
// Outfit Creation Screen for Digital Closet
// -----------------------------------------
// Allows users to review, name, and save a new outfit composed of selected articles.
// Features:
//   - Prominent, user-friendly text input for outfit naming (auto-selects all text on focus)
//   - Custom header with home navigation
//   - Grid layout for selected articles, with remove option
//   - Clean, modern UI consistent with app design
//   - Robust AsyncStorage persistence, error handling, and keyboard dismissal
//
// Designed for clarity, maintainability, and a delightful user experience.

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import uuid from 'react-native-uuid';

const OUTFITS_KEY = 'OUTFITS';


export default function CreateOutfitScreen() {
  const fitNameInputRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const initialArticles = route.params?.selectedArticles || [];
  const [articles, setArticles] = useState(initialArticles);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  // Remove an article from the selection
  const removeArticle = (id) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Save the new outfit to AsyncStorage
  const saveOutfit = async () => {
    if (articles.length === 0) {
      Alert.alert('Select at least 1 article to create an outfit.');
      return;
    }
    setSaving(true);
    try {
      const stored = await AsyncStorage.getItem(OUTFITS_KEY);
      ('Raw stored OUTFTIS_KEY:', stored);
      let existing = [];
      if (stored) {
        try {
          existing = JSON.parse(stored);
        } catch (parseErr) {
          ('Failed to parse stored outfits:', parseErr);
          existing = [];
        }
      }
      ('Parsed existing outfits:', existing);
      const newOutfit = {
        id: uuid.v4(),
        name: name.trim(),
        articleIds: articles.map((a) => a.id),
        createdAt: new Date().toISOString(),
      };
      ('New outfit to save:', newOutfit);
      await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify([newOutfit, ...existing]));
      Alert.alert('Outfit saved!');
      navigation.navigate('Outfits');
    } catch (e) {
      ('Failed to save outfit:', e);
      Alert.alert('Error', 'Failed to save outfit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Custom header row */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }} />
          {/* Centered editable name input */}
          <TextInput
          ref={fitNameInputRef}
          style={styles.fitNameInput}
          placeholder="myfitname"
          value={name}
          onChangeText={setName}
          maxLength={30}
          autoCorrect={false}
          autoCapitalize="words"
          placeholderTextColor="#b0bec5"
          textAlign="center"
          accessibilityLabel="Outfit name input"
          onFocus={() => {
            if (name && name.length > 0 && fitNameInputRef.current) {
              fitNameInputRef.current.setNativeProps({ selection: { start: 0, end: name.length } });
            }
          }}
        />
          <TouchableOpacity
            style={styles.homeIconButton}
            onPress={() => navigation.navigate('Home')}
            accessibilityLabel="Go to Home"
          >
            <Ionicons name="home" size={28} color="#1976d2" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articleGrid}
          columnWrapperStyle={styles.articleRow}
          renderItem={({ item }) => (
            <View style={styles.articleCard}>
              <Image source={{ uri: item.croppedImageUri || item.imageUri }} style={styles.articleImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeArticle(item.id)}
                accessibilityLabel={`Remove ${item.name || 'article'}`}
              >
                <Ionicons name="close-circle" size={28} color="#f44336" />
              </TouchableOpacity>
              <Text numberOfLines={1} style={styles.articleLabel}>{item.name}</Text>
            </View>
          )}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.saveButton, articles.length === 0 && styles.saveButtonDisabled]}
            onPress={saveOutfit}
            disabled={saving || articles.length === 0}
          >
            <Text style={styles.saveButtonText}>Save Outfit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    // removed, replaced by editable input
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  homeIconButton: {
    padding: 4,
    marginRight: 8,
    marginLeft: 10,
    borderRadius: 18,
    backgroundColor: '#f7f7f7',
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitNameInput: {
    flex: 2,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976d2',
    backgroundColor: '#f5faff',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#e3f2fd',
    elevation: 1,
    minWidth: 120,
    maxWidth: 240,
  },
  articleList: {
    // replaced by articleGrid
  },
  articleGrid: {
    paddingBottom: 18,
    paddingTop: 2,
    alignItems: 'stretch',
  },
  articleRow: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  articleCard: {
    width: (Dimensions.get('window').width - 24 * 2 - 24) / 2, // 24 padding on each side, 24 gap between
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    padding: 10,
    elevation: 2,
    position: 'relative',
  },
  articleImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 0,
    elevation: 2,
  },
  articleLabel: {
    fontSize: 15,
    color: '#222',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: '95%',
  },
  input: {
    // removed, replaced by fitNameInput
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginRight: 12,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#b0bec5',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
