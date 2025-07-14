// AppHeader.js
//
// Reusable Header Component for Digital Closet
// ------------------------------------------
// Consolidates header patterns from HomeScreen, GalleryScreen, OutfitsScreen, OutfitDetailScreen
// Provides consistent styling and layout with flexible props for different use cases

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows, spacing, typography } from '../../theme';

export default function AppHeader({
  title,
  showBackButton = false,
  onBackPress,
  rightElement,
  variant = 'main',
  backgroundColor = colors.white,
  showBorder = false,
  style,
}) {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[
      styles.header,
      styles[`${variant}Header`],
      backgroundColor && { backgroundColor },
      showBorder && styles.headerWithBorder,
      style
    ]}>
      {/* Left side - Back button or spacer */}
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Center - Title */}
      <View style={styles.centerSection}>
        <Text style={[styles.title, styles[`${variant}Title`]]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right side - Custom element or spacer */}
      <View style={styles.rightSection}>
        {rightElement || <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    backgroundColor: colors.white,
  },

  // Variant styles
  mainHeader: {
    paddingTop: 60, // Standardized for status bar
    paddingBottom: spacing.md,
  },

  navigationHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  simpleHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  // Border option
  headerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // Layout sections
  leftSection: {
    minWidth: 40,
    alignItems: 'flex-start',
  },

  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },

  rightSection: {
    minWidth: 40,
    alignItems: 'flex-end',
  },

  // Back button
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm, // Compensate for padding to align with edge
  },

  // Title styles
  title: {
    ...typography.styles.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  navigationTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  simpleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  // Placeholder for symmetry
  placeholder: {
    width: 40,
  },
});