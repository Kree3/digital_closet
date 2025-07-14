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
import { View, Text, TextInput, FlatList, StyleSheet, Alert, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { saveOutfit as saveOutfitService } from '../services/outfitService';
import { colors, shadows } from '../theme';
import Button from '../components/common/Button';
import ArticleCard from '../components/common/ArticleCard';


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
          { name: 'Wardrobe', params: { resetSelection: true } },
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
              placeholderTextColor={colors.textDisabled}
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
            <ArticleCard
              article={item}
              variant="grid"
              showName={true}
              onRemove={removeArticle}
              style={styles.articleCard}
            />
          )}
        />
        <View style={styles.buttonRow}>
          <Button
            title="Save Outfit"
            onPress={saveOutfit}
            disabled={articles.length === 0}
            loading={saving}
            variant="primary"
            style={styles.saveButton}
          />
          <Button
            title="Cancel"
            onPress={() => navigation.navigate('Wardrobe', { resetSelection: true })}
            variant="secondary"
            style={styles.cancelButton}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
    maxWidth: 400,
  },
  inputContainer: {
    width: 260,
    height: 44,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryBackground,
    borderRadius: 12,
    backgroundColor: colors.backgroundSubtle,
    justifyContent: 'center',
  },
  fitNameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
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
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 14,
    padding: 10,
    ...shadows.small,
    position: 'relative',
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
    marginRight: 12,
  },
  cancelButton: {
    // Keep for any additional styling if needed
  },
});
