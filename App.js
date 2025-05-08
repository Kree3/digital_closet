// App.js
//
// Entry Point for Digital Closet App
// ----------------------------------
// Sets up navigation and screen flow for the app.
// Features:
//   - Modern navigation system with bottom tabs and FAB
//   - Clean separation of concerns and maintainable structure
//   - Data migrations run at startup (image persistence, etc.)
//
// Designed for scalability and clear navigation.
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { runMigrations } from './src/services/migrationService';
import { initializeImageStorage } from './src/services/imageStorageService';
import Constants from 'expo-constants';


// Loading screen component shown during migrations

// Loading screen component shown during migrations
function LoadingScreen({ status }) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#42a5f5" />
      <Text style={styles.loadingText}>{status || 'Loading...'}</Text>
    </View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  useEffect(() => {
    // Initialize app and run migrations
    async function initialize() {
      try {
        // Initialize image storage directory
        setLoadingStatus('Setting up image storage...');
        await initializeImageStorage();
        
        // Run migrations (including image persistence)
        setLoadingStatus('Running data migrations...');
        const migrationResult = await runMigrations(appVersion);
        
        if (migrationResult.success) {
          console.log('[App] Migrations completed successfully:', migrationResult.migrations);
          if (migrationResult.migrations.some(m => m.name === 'image-persistence' && m.migratedCount > 0)) {
            console.log(`[App] Successfully migrated ${migrationResult.migrations.find(m => m.name === 'image-persistence').migratedCount} images for persistence`);
          }
        } else {
          console.warn('[App] Some migrations failed:', migrationResult.error);
        }

        // App is ready to display
        setIsReady(true);
      } catch (error) {
        console.error('[App] Error during initialization:', error);
        setLoadingStatus('Error initializing app. Please restart.');
        // We still set isReady to true to avoid getting stuck on loading screen
        setTimeout(() => setIsReady(true), 2000);
      }
    }

    initialize();
  }, []);

  // Show loading screen until migrations complete
  if (!isReady) {
    return <LoadingScreen status={loadingStatus} />;
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  }
});
