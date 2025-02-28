import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  ProfileHeader,
  PersonalInfoCard,
  TenantInfoCard,
  BiometricToggle,
  LogoutButton
} from '@/components/profile';

export default function ProfileScreen() {
  const { tenant } = useAuth();

  return (
    <ScrollView className="flex-1 bg-gray-50" contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <ProfileHeader tenant={tenant} />
      
      <View className="px-5 py-6 flex flex-col gap-5">
        <PersonalInfoCard tenant={tenant} />
        <TenantInfoCard tenant={tenant} />
        
        <View className="mb-5">
          <BiometricToggle />
        </View>
      </View>
      
      <LogoutButton />
    </ScrollView>
  );
}