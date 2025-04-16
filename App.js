// App.js
// Entry point for Digital Closet app
// Sets up navigation and screen flow
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import OutfitsScreen from './src/screens/OutfitsScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Verify" component={VerificationScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Outfits" component={OutfitsScreen} options={{ headerShown: true, title: 'Outfits' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
