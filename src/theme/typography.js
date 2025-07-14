// typography.js
//
// Typography System for Digital Closet
// -----------------------------------
// Centralized text styles and font configurations

export const typography = {
  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: 'bold',
  },

  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    xxxl: 28,
    display: 32,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Common text styles
  styles: {
    // Headers
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 34,
    },
    h2: {
      fontSize: 22,
      fontWeight: 'bold',
      lineHeight: 28,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },

    // Body text
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    body: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 18,
    },

    // UI text
    button: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
    },
  },
};

export default typography;