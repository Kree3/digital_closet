// Button.js
//
// Reusable Button Component for Digital Closet
// ------------------------------------------
// Consolidates button patterns from all screens to eliminate duplication
// Supports multiple variants: primary, secondary, destructive, icon

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, typography } from '../../theme';

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
  accessibilityLabel,
  ...props
}) {
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    disabled && styles.disabledButton,
    disabled && styles[`${variant}ButtonDisabled`],
    style
  ];

  const textStyles = [
    styles.buttonText,
    styles[`${variant}ButtonText`],
    styles[`${size}ButtonText`],
    disabled && styles.disabledButtonText,
    textStyle
  ];

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconColor = variant === 'primary' || variant === 'destructive' 
    ? colors.white 
    : colors.primary;

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'destructive' ? colors.white : colors.primary} 
        />
      );
    }

    if (variant === 'icon') {
      return icon ? <Ionicons name={icon} size={iconSize} color={iconColor} /> : null;
    }

    if (icon && title) {
      return (
        <>
          {iconPosition === 'left' && (
            <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={textStyles}>{title}</Text>
          {iconPosition === 'right' && (
            <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </>
      );
    }

    if (icon) {
      return <Ionicons name={icon} size={iconSize} color={iconColor} />;
    }

    return <Text style={textStyles}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius,
    ...shadows.small,
  },

  // Size variants
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  mediumButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: spacing.borderRadius,
  },

  largeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },

  // Button variants
  primaryButton: {
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    backgroundColor: colors.gray200,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },

  destructiveButton: {
    backgroundColor: colors.error,
  },

  iconButton: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
    ...shadows.small,
  },

  // Disabled states
  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },

  secondaryButtonDisabled: {
    backgroundColor: colors.gray200,
    borderColor: colors.borderLight,
  },

  destructiveButtonDisabled: {
    backgroundColor: colors.gray400,
  },

  // Text styles
  buttonText: {
    ...typography.styles.button,
    textAlign: 'center',
  },

  primaryButtonText: {
    color: colors.white,
  },

  secondaryButtonText: {
    color: colors.textPrimary,
  },

  destructiveButtonText: {
    color: colors.white,
  },

  disabledButtonText: {
    opacity: 0.7,
  },

  // Size-specific text
  smallButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  mediumButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  largeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Icon spacing
  iconLeft: {
    marginRight: spacing.sm,
  },

  iconRight: {
    marginLeft: spacing.sm,
  },
});