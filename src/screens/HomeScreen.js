// HomeScreen.js
//
// Home Screen for Digital Closet
// ------------------------------
// Main dashboard screen showing user stats and recent activity.
// Features:
//   - Usage statistics and visualizations
//   - Recent outfits and articles
//   - Clean, modern UI with bottom tab navigation
//
// Designed for an engaging and informative user experience.
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';
import AppHeader from '../components/common/AppHeader';
import EmptyState from '../components/common/EmptyState';

export default function HomeScreen({ navigation }) {
  // We'll keep the media functions for reference, but they'll be called from the FAB now
  // These functions can be moved to a separate service if needed

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Digital Closet"
        variant="main"
        backgroundColor={colors.backgroundPrimary}
      />
      
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Outfits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <EmptyState
          icon="time-outline"
          iconSize={48}
          message="Your recent activity will appear here"
          variant="card"
        />
      </View>
      
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Tips</Text>
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={24} color={colors.primary} style={styles.tipIcon} />
          <Text style={styles.tipText}>Use the + button to add new items to your wardrobe</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.textPrimary,
  },
  statsContainer: {
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    ...shadows.small,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  recentContainer: {
    marginTop: 30,
  },
  tipsContainer: {
    marginTop: 30,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    color: colors.textPrimary,
    flex: 1,
  },
});
