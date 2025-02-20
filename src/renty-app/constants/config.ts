// config/constants.ts
import Constants from 'expo-constants';

// Use environment variables for sensitive data
export const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3000';
export const ABLY_API_KEY = Constants.expoConfig?.extra?.ablyApiKey;
