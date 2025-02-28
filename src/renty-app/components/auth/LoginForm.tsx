import React from 'react';
import { View, Text } from 'react-native';
import { PhoneInput } from '@/components/PhoneInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  phoneNumber: string;
  passcode: string;
  onPhoneNumberChange: (value: string) => void;
  onPasscodeChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  phoneNumber,
  passcode,
  onPhoneNumberChange,
  onPasscodeChange,
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <View className="w-full max-w-[350px] gap-8">
      <View className="gap-2">
        <Text className="text-3xl font-bold text-center leading-10 py-1">
          {t('auth.welcome')}
        </Text>
        <Text className="opacity-70 text-center">
          {t('auth.subtitle')}
        </Text>
      </View>

      <View className="gap-3">
        <PhoneInput
          value={phoneNumber}
          onChange={onPhoneNumberChange}
          placeholder={t('auth.login.phoneNumber')}
        />

        <Input
          value={passcode}
          onChangeText={onPasscodeChange}
          keyboardType="numeric"
          placeholder={t('auth.login.passcode')}
          secureTextEntry
          className="w-full"
        />
      </View>

      <View className="gap-2">
        <Button
          onPress={onSubmit}
          disabled={isLoading}
          className="w-full py-4"
        >
          <Text className="text-lg font-semibold text-white">{t('auth.login.loginButton')}</Text>
        </Button>
      </View>
    </View>
  );
};
