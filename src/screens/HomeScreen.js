// HomeScreen.js
//
// Home Screen for Digital Closet
// ------------------------------
// Allows users to take a photo or upload one from their gallery to start the clothing detection flow.
// Features:
//   - Camera and gallery integration (expo-image-picker)
//   - Permission handling and user feedback
//   - Clean, modern UI with clear navigation
//
// Designed for reliability and a seamless user experience.
import React from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ navigation }) {
  // Handles taking a photo using expo-image-picker
  const takePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera permission required', 'Please allow camera access in your device settings.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.images });
    
    let imageUri = undefined;
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      imageUri = result.assets[0].uri;
    } else if (!result.canceled && result.uri) {
      imageUri = result.uri;
    }
    if (imageUri) {
      navigation.navigate('Verify', { imageUri });
    } else if (result.canceled) {
      Alert.alert('No photo selected', 'You cancelled taking a photo.');
    } else {
      Alert.alert('Error', 'No photo was returned.');
    }
  };

  // Handles picking a photo from gallery
  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photo library permission required', 'Please allow photo library access in your device settings.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.images });
    
    let imageUri = undefined;
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      imageUri = result.assets[0].uri;
    } else if (!result.canceled && result.uri) {
      imageUri = result.uri;
    }
    if (imageUri) {
      navigation.navigate('Verify', { imageUri });
    } else if (result.canceled) {
      Alert.alert('No photo selected', 'You cancelled picking a photo.');
    } else {
      Alert.alert('Error', 'No photo was returned.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.iconButton} onPress={takePhoto} accessibilityLabel="Take Photo">
            <Ionicons name="camera" size={48} color="#42a5f5" />
            <Text style={styles.iconLabel}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={pickImage} accessibilityLabel="Upload Photo">
            <Ionicons name="image" size={48} color="#42a5f5" />
            <Text style={styles.iconLabel}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Gallery')} accessibilityLabel="Go to Gallery">
            <Ionicons name="grid" size={48} color="#42a5f5" />
            <Text style={styles.iconLabel}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Outfits')} accessibilityLabel="Go to Outfits">
            <Ionicons name="shirt-outline" size={48} color="#42a5f5" />
            <Text style={styles.iconLabel}>Outfits</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  gridContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  iconButton: {
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    elevation: 2,
    minWidth: 110,
  },
  iconLabel: {
    fontSize: 15,
    color: '#222',
    marginTop: 8,
    fontWeight: '500',
  },
});
