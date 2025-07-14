// EmptyState.js
//
// Reusable Empty State Component for Digital Closet
// ------------------------------------------------
// Consolidates empty state patterns from OutfitsScreen, HomeScreen, OutfitDetailScreen
// Supports loading states, error states, and action buttons for consistent UX

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import Button from './Button';

export default function EmptyState({
  // Visual elements
  icon,
  iconSize = 48,
  iconColor = colors.textDisabled,
  
  // Text content
  title,
  message,
  
  // Loading state
  loading = false,
  loadingText = "Loading...",
  
  // Error state
  error = false,
  errorText,
  
  // Action button (optional)
  actionText,
  onActionPress,
  actionVariant = "primary",
  
  // Layout options
  variant = "fullscreen", // "fullscreen" | "inline" | "card"
  backgroundColor,
  
  // Custom styling
  style,
  contentStyle,
}) {
  
  const containerStyles = [
    styles.container,
    styles[`${variant}Container`],
    backgroundColor && { backgroundColor },
    style
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </>
      );
    }

    if (error) {
      return (
        <>
          {icon && (
            <Ionicons 
              name={icon || "alert-circle-outline"} 
              size={iconSize} 
              color={colors.error} 
            />
          )}
          <Text style={styles.errorTitle}>
            {title || "Something went wrong"}
          </Text>
          {(message || errorText) && (
            <Text style={styles.message}>
              {message || errorText}
            </Text>
          )}
          {actionText && onActionPress && (
            <Button
              title={actionText}
              onPress={onActionPress}
              variant={actionVariant}
              style={styles.actionButton}
            />
          )}
        </>
      );
    }

    // Normal empty state
    return (
      <>
        {icon && (
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={iconColor} 
          />
        )}
        {title && (
          <Text style={styles.title}>{title}</Text>
        )}
        {message && (
          <Text style={styles.message}>{message}</Text>
        )}
        {actionText && onActionPress && (
          <Button
            title={actionText}
            onPress={onActionPress}
            variant={actionVariant}
            style={styles.actionButton}
          />
        )}
      </>
    );
  };

  return (
    <View style={containerStyles}>
      <View style={[styles.content, contentStyle]}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Container variants
  fullscreenContainer: {
    flex: 1,
    padding: spacing.lg,
  },

  inlineContainer: {
    padding: spacing.lg,
  },

  cardContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 30,
    margin: spacing.md,
  },

  // Content wrapper
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },

  // Text styles
  title: {
    ...typography.styles.h2,
    color: colors.gray800,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  message: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },

  loadingText: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  errorTitle: {
    ...typography.styles.h3,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  // Action button
  actionButton: {
    marginTop: spacing.sm,
  },
});