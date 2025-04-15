// HomeScreen.js
// Lets user take or upload a photo
import React from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
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
      <Text style={styles.title}>Digital Closet</Text>
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Upload Photo" onPress={pickImage} />
      <Button title="Go to Gallery" onPress={() => navigation.navigate('Gallery')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
});
