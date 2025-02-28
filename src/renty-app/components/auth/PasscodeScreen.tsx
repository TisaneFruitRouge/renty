import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PasscodeInput } from './PasscodeInput';
import { NumericKeypad } from './NumericKeypad';
import { BiometricButton } from './BiometricButton';

interface PasscodeScreenProps {
  phoneNumber: string;
  onPasscodeSubmit: (passcode: string) => Promise<void>;
  onBiometricLogin: () => Promise<void>;
  onUseAnotherAccount: () => void;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  isLoading: boolean;
}

export const PasscodeScreen: React.FC<PasscodeScreenProps> = ({
  phoneNumber,
  onPasscodeSubmit,
  onBiometricLogin,
  onUseAnotherAccount,
  isBiometricAvailable,
  isBiometricEnabled,
  isLoading,
}) => {
  const [passcodeDigits, setPasscodeDigits] = useState(['', '', '', '', '', '']);
  const { t } = useTranslation();

  const handleKeyPress = (key: string | number) => {
    if (isLoading) return;
    
    if (key === 'delete') {
      const lastFilledIndex = passcodeDigits.findLastIndex(d => d !== '');
      if (lastFilledIndex >= 0) {
        const newPasscodeDigits = [...passcodeDigits];
        newPasscodeDigits[lastFilledIndex] = '';
        setPasscodeDigits(newPasscodeDigits);
      }
      return;
    }
    
    const emptyIndex = passcodeDigits.findIndex(d => d === '');
    if (emptyIndex >= 0) {
      const newPasscodeDigits = [...passcodeDigits];
      newPasscodeDigits[emptyIndex] = key.toString();
      setPasscodeDigits(newPasscodeDigits);
      
      // If all digits are filled, submit passcode
      if (emptyIndex === 5) {
        const passcode = newPasscodeDigits.join('');
        handleSubmitPasscode(passcode);
      }
    }
  };
  
  const handleSubmitPasscode = async (passcode: string) => {
    try {
      await onPasscodeSubmit(passcode);
    } catch (error) {
      // Clear passcode on error
      setPasscodeDigits(['', '', '', '', '', '']);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1 justify-center items-center px-6 bg-gray-50">
        <View className="w-full max-w-[350px] gap-8 items-center">
          <View className="gap-2 items-center">
            <Text className="text-3xl font-bold text-center leading-10 py-1">
              {t('auth.welcome')}
            </Text>
            <Text className="text-base opacity-70 text-center mb-2">
              {t('auth.enterPasscode', 'Enter your passcode')}
            </Text>
            
            <Text className="text-lg font-medium text-black mb-4">
              {phoneNumber}
            </Text>
          </View>
          
          <PasscodeInput passcodeDigits={passcodeDigits} />
          
          <NumericKeypad 
            onKeyPress={handleKeyPress} 
            disabled={isLoading} 
          />
          
          {isBiometricAvailable && isBiometricEnabled && (
            <BiometricButton 
              onPress={onBiometricLogin} 
              disabled={isLoading} 
            />
          )}
          
          <TouchableOpacity
            onPress={onUseAnotherAccount}
            className="mt-4"
            disabled={isLoading}
          >
            <Text className="text-black text-base">
              {t('auth.login.useAnotherAccount', 'Use another account')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};
