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
import { useNavigation, useRoute } from '@react-navigation/native';
import { saveOutfit as saveOutfitService } from '../services/outfitService';


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

  // Save the new outfit using outfitService
  const saveOutfit = async () => {
    setSaving(true);
    try {
      await saveOutfitService({ name, articles });
      Alert.alert('Outfit saved!');
      // Replace the current screen in the navigation stack with Outfits
      // This prevents going back to the outfit creation screen
      navigation.reset({
        index: 0,
        routes: [
          { name: 'Home' },
          { name: 'Gallery', params: { resetSelection: true } },
          { name: 'Outfits' }
        ],
      });
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save outfit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Custom header row */}
        <View style={styles.headerRow}>
          {/* Centered editable name input with stable, modern sizing */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={fitNameInputRef}
              style={styles.fitNameInput}
              placeholder="e.g. Summer Brunch"
              value={name}
              onChangeText={setName}
              maxLength={30}
              autoCorrect={false}
              autoCapitalize="words"
              placeholderTextColor="#b0bec5"
              textAlign={name.length === 0 ? 'center' : 'left'}
              accessibilityLabel="Outfit name input"
              onFocus={() => {
                if (name && name.length > 0 && fitNameInputRef.current) {
                  fitNameInputRef.current.setNativeProps({ selection: { start: 0, end: name.length } });
                }
              }}
            />
          </View>
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
              {/* Support all possible image fields with priority on local images for persistence */}
<Image source={{ uri: item.localImageUri || item.croppedImageUri || item.imageUri || item.imageUrl }} style={styles.articleImage} />
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
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.navigate('Gallery', { resetSelection: true })}
          >
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
    paddingTop: 72,
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    maxWidth: 400,
  },
  inputContainer: {
    width: 260,
    height: 44,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#e3f2fd',
    borderRadius: 12,
    backgroundColor: '#f5faff',
    justifyContent: 'center',
  },
  fitNameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    paddingLeft: 18,
    paddingRight: 10,
    textAlign: 'left',
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
    marginBottom: 40, // Raised for comfortable touch per mobile UX standards
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
