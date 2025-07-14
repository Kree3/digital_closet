// colors.js
//
// Centralized Color Palette for Digital Closet
// -------------------------------------------
// Consolidates 40+ hardcoded colors into a systematic, semantic color system.
// Based on comprehensive audit of existing color usage patterns.

export const colors = {
  // Primary Brand Colors
  primary: '#42a5f5',           // Main brand blue (was used 21 times)
  primaryDark: '#1976d2',       // Dark blue variant
  primaryLight: '#bbdefb',      // Light blue for disabled states
  primaryAlpha: 'rgba(66, 165, 245, 0.13)', // Light transparency
  primaryAlpha23: 'rgba(66, 165, 245, 0.23)', // Medium transparency
  primaryBackground: '#e3f2fd', // Very light blue backgrounds

  // Secondary Colors
  secondary: '#3498db',         // Alternative blue
  iosBlue: '#007AFF',          // iOS standard blue

  // Semantic Colors
  success: '#4caf50',          // Green for success states
  warning: '#ff9800',          // Orange for warnings
  error: '#f44336',            // Primary red for errors
  errorAlt: '#e74c3c',         // Alternative red
  errorDark: '#d11a2a',        // Dark red for shadows

  // Text Colors
  textPrimary: '#333',         // Primary text (used 8 times)
  textSecondary: '#757575',    // Secondary text
  textTertiary: '#888',        // Tertiary text
  textDisabled: '#b0bec5',     // Disabled/placeholder text
  textLight: '#666',           // Light text variant
  textDark: '#22223b',         // Very dark text
  textBlack: '#222',           // Near black text

  // Background Colors
  backgroundPrimary: '#fff',    // Pure white (used 18 times)
  backgroundSecondary: '#f8f8f8', // Very light gray
  backgroundTertiary: '#f7f7f7',  // Light gray
  backgroundCard: '#f6f8fa',      // Card backgrounds
  backgroundLight: '#f5f5f5',    // Light backgrounds
  backgroundSubtle: '#f5faff',   // Subtle tinted background
  backgroundMuted: '#f1f1f1',    // Muted backgrounds

  // Border Colors
  borderLight: '#f0f0f0',      // Light borders
  borderMedium: '#e0e0e0',     // Medium borders
  borderDark: '#ddd',          // Darker borders
  borderSubtle: 'rgba(0,0,0,0.03)', // Very subtle borders

  // Gray Scale (systematic progression)
  gray100: '#f8f8f8',         // Lightest
  gray200: '#f0f0f0',
  gray300: '#e0e0e0',
  gray400: '#bbb',
  gray500: '#888',
  gray600: '#666',
  gray700: '#555',
  gray800: '#424242',
  gray900: '#333',             // Darkest

  // Navigation Colors
  tabActive: '#42a5f5',        // Active tab color
  tabInactive: '#8e8e93',      // Inactive tab color

  // Overlay Colors
  overlayDark: 'rgba(0,0,0,0.5)',      // Modal overlays
  overlayLight: 'rgba(255,255,255,0.95)', // Light overlays
  shadowColor: '#000',                      // Shadow color (used 8 times)

  // Utility Colors
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
};

// Color semantic mappings for easier usage
export const semanticColors = {
  // Button colors
  buttonPrimary: colors.primary,
  buttonSecondary: colors.gray300,
  buttonDestructive: colors.error,
  buttonDisabled: colors.primaryLight,

  // Status colors
  statusSuccess: colors.success,
  statusWarning: colors.warning,
  statusError: colors.error,
  statusInfo: colors.primary,

  // Surface colors
  surfacePrimary: colors.backgroundPrimary,
  surfaceSecondary: colors.backgroundSecondary,
  surfaceCard: colors.backgroundCard,
  surfaceOverlay: colors.overlayDark,
};

export default colors;