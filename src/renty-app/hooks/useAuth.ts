import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  tenant: any | null;
  login: (phoneNumber: string, passcode: string) => Promise<void>;
  logout: () => Promise<void>;
  setupBiometric: () => Promise<void>;
  loginWithBiometric: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  tenant: null,

  login: async (phoneNumber: string, passcode: string) => {
    try {
      const { data } = await api.post('/api/login', {
        phoneNumber,
        passcode,
      });

      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      
      set({ isAuthenticated: true, tenant: data.tenant });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('biometricEnabled');
    set({ isAuthenticated: false, tenant: null });
  },

  setupBiometric: async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      throw new Error('Biometric authentication not available');
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      throw new Error('No biometrics enrolled on this device');
    }

    const auth = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to enable biometric login',
      fallbackLabel: 'Use passcode',
    });

    if (auth.success) {
      await SecureStore.setItemAsync('biometricEnabled', 'true');
      await api.post('/api/auth/enable-biometric');
    }
  },

  loginWithBiometric: async () => {
    const biometricEnabled = await SecureStore.getItemAsync('biometricEnabled');
    if (!biometricEnabled) {
      throw new Error('Biometric login not enabled');
    }

    const auth = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with biometrics',
      fallbackLabel: 'Use passcode',
    });

    if (auth.success) {
      // Verify with backend and get new tokens
      const { data } = await api.post('/api/auth/biometric-login');
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      set({ isAuthenticated: true, tenant: data.tenant });
    }
  },
}));