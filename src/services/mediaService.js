// mediaService.js
// Service for handling camera/gallery permissions and image picking
// Follows Clean Architecture: screens call these functions for all media flows

import * as ImagePicker from 'expo-image-picker';

/**
 * Launch camera with permission handling.
 * @returns {Promise<{ imageUri?: string, error?: string, canceled?: boolean }>}
 */
export async function takePhotoWithPermission() {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return { error: 'Camera permission required. Please allow camera access in your device settings.' };
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.images, base64: true });
    if (result.canceled) return { canceled: true };
    if (result.assets && result.assets[0]?.uri) return { imageUri: result.assets[0].uri };
    if (result.uri) return { imageUri: result.uri };
    return { error: 'No photo was returned.' };
  } catch (e) {
    return { error: 'Failed to take photo.' };
  }
}

/**
 * Launch image picker with permission handling.
 * @returns {Promise<{ imageUri?: string, error?: string, canceled?: boolean }>}
 */
export async function pickImageWithPermission() {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return { error: 'Photo library permission required. Please allow photo library access in your device settings.' };
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.images, base64: true });
    if (result.canceled) return { canceled: true };
    if (result.assets && result.assets[0]?.uri) return { imageUri: result.assets[0].uri };
    if (result.uri) return { imageUri: result.uri };
    return { error: 'No photo was returned.' };
  } catch (e) {
    return { error: 'Failed to pick photo.' };
  }
}
