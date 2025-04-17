// HomeScreen.js
//
// Home Screen for Digital Closet
// ------------------------------
// Allows users to take a photo or upload one from their gallery to start the clothing detection flow.
// Features:
//   - Camera and gallery integration (via mediaService)
//   - Permission handling and user feedback (via mediaService)
//   - Clean, modern UI with clear navigation
//
// Designed for reliability and a seamless user experience.
import React from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { takePhotoWithPermission, pickImageWithPermission } from '../services/mediaService';

export default function HomeScreen({ navigation }) {
  // Handles taking a photo using the media service
  const takePhoto = async () => {
    const result = await takePhotoWithPermission();
    if (result.imageUri) {
      navigation.navigate('Verify', { imageUri: result.imageUri });
    } else if (result.canceled) {
      Alert.alert('No photo selected', 'You cancelled taking a photo.');
    } else if (result.error) {
      Alert.alert('Camera Error', result.error);
    }
  };

  // Handles picking a photo from gallery using the media service
  const pickImage = async () => {
    const result = await pickImageWithPermission();
    if (result.imageUri) {
      navigation.navigate('Verify', { imageUri: result.imageUri });
    } else if (result.canceled) {
      Alert.alert('No photo selected', 'You cancelled selecting a photo.');
    } else if (result.error) {
      Alert.alert('Gallery Error', result.error);
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
