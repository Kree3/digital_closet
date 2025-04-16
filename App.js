// App.js
//
// Entry Point for Digital Closet App
// ----------------------------------
// Sets up navigation and screen flow for the app.
// Features:
//   - Stack navigation for Home, Verification, Gallery, Outfits, and CreateOutfit screens
//   - Clean separation of concerns and maintainable structure
//
// Designed for scalability and clear navigation.
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import OutfitsScreen from './src/screens/OutfitsScreen';
import CreateOutfitScreen from './src/screens/CreateOutfitScreen'; // <-- Added import


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Verify" component={VerificationScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Outfits" component={OutfitsScreen} options={{ headerShown: true, title: 'Outfits' }} />
        <Stack.Screen name="CreateOutfit" component={CreateOutfitScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
