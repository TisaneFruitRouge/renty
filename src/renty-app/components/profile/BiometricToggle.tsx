import { View, Switch, Platform, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/hooks/useAuth';

export function BiometricToggle() {
  const { t } = useTranslation();
  const { tenant, setupBiometric } = useAuth();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  
  useEffect(() => {
    // Check if biometric authentication is available
    const checkBiometricAvailability = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(compatible && enrolled);
        
        // Check if user has enabled biometric login
        const biometricEnabled = await SecureStore.getItemAsync('biometricEnabled');
        setIsBiometricEnabled(!!biometricEnabled);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
      }
    };
    
    checkBiometricAvailability();
  }, []);
  
  const toggleBiometric = async (value: boolean) => {
    try {
      if (value) {
        // Enable biometric
        await setupBiometric(tenant?.id!);
        setIsBiometricEnabled(true);
      } else {
        // Disable biometric
        await SecureStore.deleteItemAsync('biometricEnabled');
        setIsBiometricEnabled(false);
      }
    } catch (error) {
      console.error('Biometric toggle failed:', error);
      // Reset switch to previous state
      setIsBiometricEnabled(!value);
      
      // Show error message
      Alert.alert(
        t('profile.biometricError', 'Biometric Error'),
        error.message || t('profile.biometricErrorMessage', 'Failed to setup biometric authentication'),
        [{ text: 'OK' }]
      );
    }
  };

  // Get the appropriate biometric type name for the current device
  const getBiometricName = () => {
    if (Platform.OS === 'ios') {
      return 'Face ID/Touch ID';
    } else {
      return t('profile.fingerprint', 'Fingerprint');
    }
  };

  if (!isBiometricAvailable) {
    return null;
  }

  return (
    <View className="bg-white rounded-xl shadow-sm overflow-hidden">
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-800">{t('profile.security', 'Security')}</Text>
        <MaterialIcons name="security" size={20} />
      </View>
      
      <View className="p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons 
              name={Platform.OS === 'ios' ? 'fingerprint' : 'fingerprint'} 
              size={24} 
              color="#4f46e5" 
            />
            <View className="ml-3">
              <Text className="text-gray-800 font-medium">
                {t('profile.biometricLogin', 'Biometric Login')}
              </Text>
              <Text className="text-gray-500 text-xs">
                {t('profile.loginWith', 'Login with')} {getBiometricName()}
              </Text>
            </View>
          </View>
          <Switch
            value={isBiometricEnabled}
            onValueChange={toggleBiometric}
            trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
            thumbColor={isBiometricEnabled ? '#4f46e5' : '#f3f4f6'}
          />
        </View>
      </View>
    </View>
  );
}
