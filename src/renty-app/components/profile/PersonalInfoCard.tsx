import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Tenant, Property } from '@/lib/types';

type PersonalInfoCardProps = {
  tenant: Tenant & { property: Property } | null;
};

export function PersonalInfoCard({ tenant }: PersonalInfoCardProps) {
  const { t } = useTranslation();

  return (
    <View className="bg-white rounded-xl shadow-sm overflow-hidden">
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-800">{t('profile.personalInfo')}</Text>
        <MaterialIcons name="person" size={20} />
      </View>
      
      <View className="p-5 space-y-4">
        <View className="flex-row border-b border-gray-100 pb-3">
          <View className="w-1/3">
            <Text className="text-gray-500 text-sm">{t('profile.email')}</Text>
          </View>
          <View className="w-2/3">
            <Text className="text-gray-800 font-medium">
              {tenant?.email}
              {tenant?.emailVerified && (
                <MaterialIcons name="verified" size={16} color="#22c55e" style={{ marginLeft: 4 }} />
              )}
            </Text>
          </View>
        </View>
        
        <View className="flex-row border-b border-gray-100 pb-3">
          <View className="w-1/3">
            <Text className="text-gray-500 text-sm">{t('profile.phone')}</Text>
          </View>
          <View className="w-2/3">
            <Text className="text-gray-800 font-medium">
              {tenant?.phoneNumber || t('profile.notProvided')}
              {tenant?.phoneVerified && tenant?.phoneNumber && (
                <MaterialIcons name="verified" size={16} color="#22c55e" style={{ marginLeft: 4 }} />
              )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
