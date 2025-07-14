// ArticleCard.js
//
// Reusable Article Card Component for Digital Closet
// -------------------------------------------------
// Consolidates article display patterns from OutfitDetailScreen, CreateOutfitScreen, 
// VerificationScreen, CategoryCarousel, and OutfitsScreen
// Supports multiple layouts, selection states, and interaction patterns

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, typography } from '../../theme';
import Button from './Button';

export default function ArticleCard({
  // Article data
  article,
  
  // Layout variants
  variant = 'list', // 'list' | 'grid' | 'carousel' | 'preview' | 'verification'
  
  // Image configuration
  imageSize,
  imageStyle,
  
  // Content display options
  showName = true,
  showCategory = false,
  showWearCount = false,
  showConfidence = false,
  
  // Selection state
  selectionMode = false,
  selected = false,
  onSelect,
  
  // Actions
  onPress,
  onRemove,
  removeIcon = 'close-circle',
  
  // URL validation (for carousel variant)
  validateUrls = false,
  
  // Styling
  style,
  contentStyle,
  textStyle,
  
  // Accessibility
  accessibilityLabel,
  testID,
}) {
  
  // Get the best available image URI using the standard fallback chain
  const getImageUri = () => {
    return article.localImageUri || 
           article.croppedImageUri || 
           article.imageUri || 
           article.imageUrl;
  };
  
  // Check if image URL is valid/expired (for carousel variant)
  const checkImageStatus = () => {
    const uri = getImageUri();
    if (!uri) return { valid: false, expired: false };
    
    if (validateUrls) {
      // Only validate remote URLs (those that start with http or https)
      if (uri.startsWith('http')) {
        // Import would be needed: import { validateImageUrl } from '../../services/urlValidationService';
        // For now, simulate validation logic
        // In a real implementation, you'd call validateImageUrl(uri) here
        return { valid: true, expired: false };
      }
    }
    
    return { valid: !!uri, expired: false };
  };
  
  const imageStatus = checkImageStatus();
  const imageUri = getImageUri();
  
  // Get display text for article name/description
  const getDisplayName = () => {
    return article.description || article.name || 'Article';
  };
  
  // Get wear count text
  const getWearCountText = () => {
    const wearCount = typeof article.wearCount === 'number' ? article.wearCount : 0;
    return `Worn ${wearCount} time${wearCount !== 1 ? 's' : ''}`;
  };
  
  // Get confidence percentage text
  const getConfidenceText = () => {
    if (typeof article.confidence === 'number') {
      return `${(article.confidence * 100).toFixed(1)}%`;
    }
    return null;
  };
  
  // Render image or placeholder
  const renderImage = () => {
    const imageStyles = [
      styles.image,
      styles[`${variant}Image`],
      imageStyle
    ];
    
    if (imageStatus.valid && imageUri) {
      return (
        <Image 
          source={{ uri: imageUri }}
          style={imageStyles}
          resizeMode="cover"
        />
      );
    }
    
    // Render placeholder based on variant and status
    const placeholderStyles = [
      styles.placeholder,
      styles[`${variant}Placeholder`]
    ];
    
    if (variant === 'verification') {
      return (
        <View style={placeholderStyles}>
          <Text style={styles.emojiPlaceholder}>🧦</Text>
          <Text style={styles.placeholderText}>Image not available for this item.</Text>
        </View>
      );
    }
    
    if (variant === 'carousel') {
      return (
        <View style={placeholderStyles}>
          {imageStatus.expired ? (
            <>
              <Ionicons name="refresh-circle" size={32} color={colors.primary} />
              <Text style={styles.placeholderText}>Refresh Needed</Text>
            </>
          ) : (
            <>
              <Ionicons name="image-outline" size={32} color={colors.gray500} />
              <Text style={styles.placeholderText}>No Image</Text>
            </>
          )}
        </View>
      );
    }
    
    // Default placeholder
    return (
      <View style={placeholderStyles}>
        <Ionicons name="image-outline" size={24} color={colors.textDisabled} />
      </View>
    );
  };
  
  // Render content based on variant
  const renderContent = () => {
    if (variant === 'carousel') {
      // Carousel variant shows only image with optional selection overlay
      return (
        <>
          {renderImage()}
          {selected && selectionMode && (
            <View style={styles.selectionOverlay}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark" size={20} color={colors.white} />
              </View>
            </View>
          )}
        </>
      );
    }
    
    if (variant === 'list') {
      // List variant: horizontal layout with image + text info
      return (
        <>
          {renderImage()}
          <View style={[styles.textContent, styles.listTextContent, contentStyle]}>
            {showName && (
              <Text style={[styles.articleName, styles.listArticleName, textStyle]}>
                {getDisplayName()}
              </Text>
            )}
            {showCategory && (
              <Text style={[styles.articleCategory, styles.listArticleCategory]}>
                {article.category || 'Uncategorized'}
              </Text>
            )}
            {showWearCount && (
              <View style={styles.wearCountContainer}>
                <Ionicons name="repeat" size={16} color={colors.textSecondary} />
                <Text style={styles.wearCountText}>{getWearCountText()}</Text>
              </View>
            )}
            {showConfidence && getConfidenceText() && (
              <Text style={styles.confidenceText}>{getConfidenceText()}</Text>
            )}
          </View>
        </>
      );
    }
    
    // Grid, verification and other variants: vertical layout with image + optional text
    const textContentStyle = variant === 'verification' ? styles.verificationTextContent : styles.gridTextContent;
    const nameStyle = variant === 'verification' ? styles.verificationArticleName : styles.gridArticleName;
    
    return (
      <>
        {renderImage()}
        {onRemove && (
          <Button
            variant="icon"
            icon={removeIcon}
            onPress={() => onRemove(article.id)}
            accessibilityLabel={`Remove ${getDisplayName()}`}
            style={styles.removeButton}
          />
        )}
        {(showName || showConfidence) && (
          <View style={[styles.textContent, textContentStyle, contentStyle]}>
            {showName && (
              <Text 
                numberOfLines={variant === 'grid' ? 1 : 2}
                style={[styles.articleName, nameStyle, textStyle]}
              >
                {getDisplayName()}
              </Text>
            )}
            {showConfidence && getConfidenceText() && (
              <Text style={styles.confidenceText}>{getConfidenceText()}</Text>
            )}
          </View>
        )}
      </>
    );
  };
  
  // Container styles
  const containerStyles = [
    styles.container,
    styles[`${variant}Container`],
    selected && selectionMode && styles.selectedContainer,
    selected && selectionMode && styles[`${variant}SelectedContainer`],
    style
  ];
  
  // Handle press events
  const handlePress = () => {
    if (selectionMode && onSelect) {
      onSelect(article.id);
    } else if (onPress) {
      onPress(article);
    }
  };
  
  const Component = (onPress || (selectionMode && onSelect)) ? TouchableOpacity : View;
  
  return (
    <Component
      style={containerStyles}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel || getDisplayName()}
      testID={testID}
    >
      {renderContent()}
    </Component>
  );
}

const styles = StyleSheet.create({
  // Base container
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Container variants
  listContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 16,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  
  gridContainer: {
    margin: 8,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  
  carouselContainer: {
    width: 110,
    height: 150,
    marginRight: 12,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  
  previewContainer: {
    // For outfit previews - handled by parent
  },
  
  verificationContainer: {
    margin: 10,
    width: 150,
    minHeight: 200,
    ...shadows.medium,
    borderWidth: 3,
    borderColor: colors.transparent,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  
  // Selected states
  selectedContainer: {
    borderWidth: 2,
  },
  
  listSelectedContainer: {
    borderColor: colors.primary,
  },
  
  gridSelectedContainer: {
    borderColor: colors.primary,
  },
  
  carouselSelectedContainer: {
    borderColor: colors.primary,
  },
  
  verificationSelectedContainer: {
    borderColor: colors.primary,
  },
  
  // Image styles
  image: {
    backgroundColor: colors.backgroundLight,
  },
  
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  
  previewImage: {
    width: '50%',
    height: '50%',
  },
  
  verificationImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  // Placeholder styles
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray100,
  },
  
  listPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  
  gridPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  
  carouselPlaceholder: {
    width: '100%',
    height: '100%',
  },
  
  verificationPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  emojiPlaceholder: {
    fontSize: 36,
    color: colors.gray400,
    marginBottom: 4,
  },
  
  placeholderText: {
    fontSize: 13,
    color: colors.gray400,
    textAlign: 'center',
  },
  
  // Text content
  textContent: {
    justifyContent: 'center',
  },
  
  listTextContent: {
    flex: 1,
    marginLeft: 16,
  },
  
  gridTextContent: {
    padding: 12,
  },
  
  verificationTextContent: {
    alignItems: 'center',
  },
  
  // Text styles
  articleName: {
    ...typography.styles.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  
  listArticleName: {
    fontSize: 16,
    marginBottom: 4,
  },
  
  gridArticleName: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  verificationArticleName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  articleCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  
  wearCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  wearCountText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  
  confidenceText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Selection overlay (for carousel)
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkmarkCircle: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Remove button
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
});