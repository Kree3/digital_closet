// spacing.js
//
// Spacing Constants for Digital Closet
// -----------------------------------
// Provides consistent spacing values based on 8px grid system

export const spacing = {
  // Base unit (8px grid system)
  unit: 8,

  // Common spacing values
  xs: 4,    // 0.5 unit
  sm: 8,    // 1 unit
  md: 16,   // 2 units
  lg: 24,   // 3 units
  xl: 32,   // 4 units
  xxl: 40,  // 5 units
  xxxl: 48, // 6 units

  // Specific use cases
  screenPadding: 20,        // Common screen padding
  cardPadding: 16,          // Card internal padding
  sectionPadding: 24,       // Section spacing
  headerPadding: 20,        // Header padding
  buttonPadding: 12,        // Button padding
  iconSize: 24,             // Standard icon size
  iconSizeLarge: 32,        // Large icon size
  borderRadius: 8,          // Standard border radius
  borderRadiusLarge: 16,    // Large border radius
  borderRadiusSmall: 4,     // Small border radius

  // Layout specific
  tabBarHeight: 80,         // Tab bar height
  headerHeight: 60,         // Header height
  fabSize: 64,              // FAB button size
  fabIconSize: 34,          // FAB icon size
};

export default spacing;