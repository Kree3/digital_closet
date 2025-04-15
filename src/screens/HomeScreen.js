// HomeScreen.js
// Lets user take or upload a photo
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
      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton} onPress={takePhoto} accessibilityLabel="Take Photo">
          <Ionicons name="camera" size={48} color="#42a5f5" />
          <Text style={styles.iconLabel}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage} accessibilityLabel="Upload Photo">
          <Ionicons name="image" size={48} color="#42a5f5" />
          <Text style={styles.iconLabel}>Upload Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Gallery')} accessibilityLabel="Go to Gallery">
          <Ionicons name="grid" size={48} color="#42a5f5" />
          <Text style={styles.iconLabel}>Gallery</Text>
        </TouchableOpacity>
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
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  iconButton: {
    alignItems: 'center',
    marginHorizontal: 18,
  },
  iconLabel: {
    fontSize: 15,
    color: '#222',
    marginTop: 8,
    fontWeight: '500',
  },
});
