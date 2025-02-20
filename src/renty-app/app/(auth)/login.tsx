import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { PhoneInput } from '@/components/PhoneInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithBiometric } = useAuth();

  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login(phoneNumber, passcode);
    } catch (error) {
      // Show error toast/alert
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 24
      }}>
        <View style={{ width: '100%', maxWidth: 350, gap: 32 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ 
              fontSize: 32, 
              fontWeight: 'bold', 
              textAlign: 'center',
              lineHeight: 40,
              paddingVertical: 4
            }}>
              {t('auth.welcome')}
            </Text>
            <Text style={{ opacity: 0.7, textAlign: 'center' }}>
              {t('auth.subtitle')}
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder={t('auth.login.phoneNumber')}
              style={{ width: '100%' }}
            />
    
            <Input
              value={passcode}
              onChangeText={setPasscode}
              keyboardType="numeric"
              placeholder={t('auth.login.passcode')}
              secureTextEntry
              style={{ width: '100%' }}
            />
          </View>
  
          <View style={{ gap: 8 }}>
            <Button
              onPress={handleLogin}
              disabled={isLoading}
              style={{ width: '100%', paddingVertical: 16 }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600' }}>{t('auth.login.loginButton')}</Text>
            </Button>
    
            <Button
              variant="ghost"
              onPress={loginWithBiometric}
              style={{ width: '100%' }}
            >
              <Text style={{ fontWeight: '500' }}>{t('auth.login.biometricButton')}</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
