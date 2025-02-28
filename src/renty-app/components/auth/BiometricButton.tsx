import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTranslation } from 'react-i18next';

interface BiometricButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const BiometricButton: React.FC<BiometricButtonProps> = ({ 
  onPress, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-center mt-6 gap-2"
      disabled={disabled}
    >
      <IconSymbol 
        name={Platform.OS === 'ios' ? 'faceid' : 'fingerprint'} 
        size={28} 
        color="#000" 
      />
      <Text className="text-black text-base font-medium">
        {t('auth.login.biometricButton', `Login with ${Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint'}`)}
      </Text>
    </TouchableOpacity>
  );
};
