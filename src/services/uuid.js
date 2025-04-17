// uuid.js
// Wrapper for react-native-uuid to provide a UUID string for each call
import uuid from 'react-native-uuid';
export default () => uuid.v4();
