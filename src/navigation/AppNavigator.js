// AppNavigator.js
//
// Main Navigation Configuration for Digital Closet
// ----------------------------------------------
// Implements a modern navigation system with:
//   - Bottom tab navigator for main sections (Home, Wardrobe, Outfits)
//   - Floating Action Button (FAB) for primary actions
//   - Stack navigators within each tab for proper navigation flow
//
// Follows Clean Architecture principles with UI-only concerns in this file.

import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

// Enable screens for better performance
enableScreens();

// Import screens
import HomeScreen from '../screens/HomeScreen';
import GalleryScreen from '../screens/GalleryScreen';
import OutfitsScreen from '../screens/OutfitsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import CreateOutfitScreen from '../screens/CreateOutfitScreen';
import OutfitDetailScreen from '../screens/OutfitDetailScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Import media service for camera and image picker
import { takePhotoWithPermission, pickImageWithPermission } from '../services/mediaService';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { clearAllArticles } from '../services/galleryService';

// FAB Menu component that appears when + button is pressed
function FabMenu({ navigation, onClose }) {
  // Handles taking a photo using the media service
  const takePhoto = async () => {
    onClose();
    const result = await takePhotoWithPermission();
    console.log('[AppNavigator] takePhoto result:', result);
    if (result.assets && result.assets[0]?.base64) {
      navigation.navigate('Verify', { imageUri: `data:image/jpeg;base64,${result.assets[0].base64}` });
    } else if (result.base64) {
      navigation.navigate('Verify', { imageUri: `data:image/jpeg;base64,${result.base64}` });
    } else if (result.imageUri || result.uri) {
      const uri = result.imageUri || result.uri;
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        navigation.navigate('Verify', { imageUri: `data:image/jpeg;base64,${base64}` });
      } catch (e) {
        console.error('[AppNavigator] Failed to read image as base64:', e);
        navigation.navigate('Verify', { imageUri: uri });
      }
    } else if (result.canceled) {
      Alert.alert('No photo selected', 'You cancelled taking a photo.');
    } else if (result.error) {
      Alert.alert('Camera Error', result.error);
    }
  };

  // Handles picking a photo from gallery using the media service
  const pickImage = async () => {
    onClose();
    const result = await pickImageWithPermission();
    console.log('[AppNavigator] pickImage result:', result);
    if (result.assets && result.assets[0]?.base64) {
      navigation.navigate('Verify', { imageUri: `data:image/jpeg;base64,${result.assets[0].base64}` });
    } else if (result.base64) {
      navigation.navigate('Verify', { imageUri: `data:image/jpeg;base64,${result.base64}` });
    } else if (result.imageUri || result.uri) {
      const uri = result.imageUri || result.uri;
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        navigation.navigate('Verify', { imageUri: `data:image/jpeg;base64,${base64}` });
      } catch (e) {
        console.error('[AppNavigator] Failed to read image as base64:', e);
        navigation.navigate('Verify', { imageUri: uri });
      }
    } else if (result.canceled) {
      Alert.alert('No photo selected', 'You cancelled selecting a photo.');
    } else if (result.error) {
      Alert.alert('Gallery Error', result.error);
    }
  };
  
  return (
    <View style={styles.fabMenuContainer}>
      <TouchableOpacity 
        style={styles.fabMenuOverlay} 
        activeOpacity={1} 
        onPress={onClose} 
      />
      <View style={styles.fabMenuButtonsContainer}>
        <TouchableOpacity 
          style={[styles.fabMenuButton, styles.fabMenuButtonDanger]}
          onPress={async () => {
            onClose();
            Alert.alert(
              'Clear Closet',
              'Are you sure you want to clear all articles? This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Clear', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await clearAllArticles();
                      Alert.alert('Success', 'Closet cleared successfully.');
                    } catch (e) {
                      console.error('[AppNavigator] Error clearing closet:', e);
                      Alert.alert('Error', 'Failed to clear closet.');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="bug" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.fabMenuButton}
          onPress={pickImage}
        >
          <Ionicons name="image" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.fabMenuButton, styles.fabMenuButtonBottom]}
          onPress={takePhoto}
        >
          <Ionicons name="camera" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Custom Tab Bar with FAB
function CustomTabBar({ state, descriptors, navigation }) {
  const [fabOpen, setFabOpen] = React.useState(false);

  return (
    <>
      {fabOpen && (
        <FabMenu 
          navigation={navigation} 
          onClose={() => setFabOpen(false)}
        />
      )}
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          // Handle the FAB button (now on the right side)
          if (route.name === 'FabTab') {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.fabContainer}
                onPress={() => setFabOpen(!fabOpen)}
              >
                <View style={styles.fab}>
                  <Ionicons name="add" size={34} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons
                name={options.tabBarIconName}
                size={28}
                color={isFocused ? '#42a5f5' : '#8e8e93'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Verify" 
        component={VerificationScreen} 
      />
    </Stack.Navigator>
  );
}

// Wardrobe Stack Navigator
function WardrobeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="WardrobeScreen" 
        component={GalleryScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Outfits Stack Navigator
function OutfitsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="OutfitsScreen" 
        component={OutfitsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="OutfitDetail" 
        component={OutfitDetailScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="CreateOutfit" 
        component={CreateOutfitScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator with FAB
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{
          tabBarIconName: 'home',
        }}
      />
      <Tab.Screen 
        name="Wardrobe" 
        component={WardrobeStack} 
        options={{
          tabBarIconName: 'file-tray-stacked',
        }}
      />
      <Tab.Screen 
        name="Outfits" 
        component={OutfitsStack} 
        options={{
          tabBarIconName: 'shirt-outline',
        }}
      />
      <Tab.Screen 
        name="FabTab" 
        component={View} 
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Verify" component={VerificationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 80,
    paddingBottom: 25,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 5,
  },
  fabContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingRight: 10,
    paddingBottom: 5,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#42a5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    bottom: 28,
  },

  fabMenuContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  fabMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fabMenuButtonsContainer: {
    position: 'absolute',
    bottom: '20%',  // Position lower on the screen
    right: 30,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabMenuButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#42a5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 40,
  },
  fabMenuButtonBottom: {
    marginBottom: 0,
  },
  fabMenuButtonDanger: {
    backgroundColor: '#e74c3c',
    marginTop: 40,
  },
});
