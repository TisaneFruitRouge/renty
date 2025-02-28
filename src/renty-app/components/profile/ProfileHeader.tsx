import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Tenant } from '@/lib/types';

type ProfileHeaderProps = {
  tenant: Tenant | null;
};

export function ProfileHeader({ tenant }: ProfileHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="w-full pt-16 pb-8 px-6 items-center bg-gradient-to-b from-gray-50 to-gray-100">
      <View className="rounded-full h-28 w-28 bg-white shadow-lg overflow-hidden border-4 border-white mb-5">
        {tenant?.avatarUrl ? (
          <Image 
            source={{ uri: tenant.avatarUrl }} 
            className="w-full h-full" 
            resizeMode="cover" 
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-primary/5">
            <Text className="text-4xl font-bold text-primary">
              {tenant?.firstName?.charAt(0)}{tenant?.lastName?.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-primary text-2xl font-bold">
        {tenant?.firstName} {tenant?.lastName}
      </Text>
      <Text className="text-gray-500 text-sm mt-2">
        {tenant?.email}
      </Text>
      
      {/* Edit Profile Button */}
      <TouchableOpacity 
        onPress={() => router.push('/edit-profile')}
        className="mt-4 flex-row items-center bg-primary/10 px-4 py-2 rounded-full"
      >
        <MaterialIcons name="edit" size={16} />
        <Text className="text-primary text-sm font-medium ml-2">
          {t('profile.editInfo')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
