// index.js
//
// Main Theme Export for Digital Closet
// -----------------------------------
// Centralizes all theme-related exports for easy importing

import colors, { semanticColors } from './colors';
import spacing from './spacing';
import typography from './typography';

// Shadow presets based on common usage patterns
export const shadows = {
  small: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fab: {
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
};

// Complete theme object
export const theme = {
  colors,
  semanticColors,
  spacing,
  typography,
  shadows,
};

// Individual exports for convenience
export { colors, semanticColors, spacing, typography };

export default theme;