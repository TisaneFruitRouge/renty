import { useState, useEffect } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { PasscodeScreen } from '@/components/auth/PasscodeScreen';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [hasPhoneNumber, setHasPhoneNumber] = useState(false);
  const { login, loginWithBiometric } = useAuth();
  
  useEffect(() => {
    // Load saved phone number and check biometric status
    const initializeLoginScreen = async () => {
      try {
        // Retrieve saved phone number
        const savedPhoneNumber = await SecureStore.getItemAsync('savedPhoneNumber');
        if (savedPhoneNumber) {
          setPhoneNumber(savedPhoneNumber);
          setHasPhoneNumber(true);
        }
        
        // Check hardware compatibility
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(compatible && enrolled);
        
        // Check if user has previously enabled biometric login
        const biometricEnabled = await SecureStore.getItemAsync('biometricEnabled');
        setIsBiometricEnabled(!!biometricEnabled);
        
        // If biometric is available and enabled, prompt for biometric login automatically
        if (compatible && enrolled && biometricEnabled && savedPhoneNumber) {
          handleBiometricLogin();
        }
      } catch (error) {
        console.error('Error initializing login screen:', error);
      }
    };
    
    initializeLoginScreen();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Save phone number for future logins
      await SecureStore.setItemAsync('savedPhoneNumber', phoneNumber);
      
      await login(phoneNumber, passcode);
    } catch (error) {
      // Show error toast/alert
      Alert.alert(
        'Login Failed',
        'Invalid phone number or passcode. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasscodeLogin = async (submittedPasscode: string) => {
    try {
      setIsLoading(true);
      setPasscode(submittedPasscode);
      await login(phoneNumber, submittedPasscode);
    } catch (error) {
      // Show error toast/alert
      Alert.alert(
        'Login Failed',
        'Invalid passcode. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Login failed:', error);
      throw error; // Re-throw to allow component to reset passcode
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get the saved phone number
      const savedPhoneNumber = await SecureStore.getItemAsync('savedPhoneNumber');
      if (!savedPhoneNumber) {
        throw new Error('No saved phone number found');
      }
      
      await loginWithBiometric();
    } catch (error) {
      // Only show error if it's not a user cancellation
      if (error.message !== 'Biometric login not enabled' && 
          !error.message?.includes('user canceled')) {
        Alert.alert(
          'Biometric Login Failed',
          'Could not authenticate with biometrics. Please use your passcode.',
          [{ text: 'OK' }]
        );
      }
      console.error('Biometric login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUseAnotherAccount = () => {
    setHasPhoneNumber(false);
    setPhoneNumber('');
    setPasscode('');
  };

  // Render the passcode screen when phone number is saved
  if (hasPhoneNumber) {
    return (
      <PasscodeScreen
        phoneNumber={phoneNumber}
        onPasscodeSubmit={handlePasscodeLogin}
        onBiometricLogin={handleBiometricLogin}
        onUseAnotherAccount={handleUseAnotherAccount}
        isBiometricAvailable={isBiometricAvailable}
        isBiometricEnabled={isBiometricEnabled}
        isLoading={isLoading}
      />
    );
  }

  // Original login screen for first-time users
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1 justify-center items-center px-6">
        <LoginForm
          phoneNumber={phoneNumber}
          passcode={passcode}
          onPhoneNumberChange={setPhoneNumber}
          onPasscodeChange={setPasscode}
          onSubmit={handleLogin}
          isLoading={isLoading}
        />
      </SafeAreaView>
    </>
  );
}
