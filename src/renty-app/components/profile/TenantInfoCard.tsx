import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Tenant, Property } from '@/lib/types';

type TenantInfoCardProps = {
  tenant: Tenant & { property: Property } | null;
};

export function TenantInfoCard({ tenant }: TenantInfoCardProps) {
  const { t } = useTranslation();

  return (
    <View className="bg-white rounded-xl shadow-sm overflow-hidden">
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-800">{t('profile.tenantInfo')}</Text>
        <MaterialIcons name="home" size={20} />
      </View>
      
      <View className="p-5 space-y-4">
        <View className="flex-row border-b border-gray-100 pb-3">
          <View className="w-1/3">
            <Text className="text-gray-500 text-sm">{t('profile.property')}</Text>
          </View>
          <View className="w-2/3">
            <Text className="text-gray-800 font-medium">
              {[tenant?.property?.address, tenant?.property?.city, tenant?.property?.country].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>
        
        <View className="flex-row border-b border-gray-100 pb-3">
          <View className="w-1/3">
            <Text className="text-gray-500 text-sm">{t('profile.leaseStart')}</Text>
          </View>
          <View className="w-2/3">
            <Text className="text-gray-800 font-medium">
              {tenant?.startDate ? new Date(tenant.startDate).toLocaleDateString() : t('profile.notProvided')}
            </Text>
          </View>
        </View>
        
        <View className="flex-row border-b border-gray-100 pb-3">
          <View className="w-1/3">
            <Text className="text-gray-500 text-sm">{t('profile.leaseEnd')}</Text>
          </View>
          <View className="w-2/3">
            <Text className="text-gray-800 font-medium">
              {tenant?.endDate ? new Date(tenant.endDate).toLocaleDateString() : t('profile.notProvided')}
            </Text>
          </View>
        </View>
        
        <View className="flex-row">
          <View className="w-1/3">
            <Text className="text-gray-500 text-sm">{t('profile.monthlyRent')}</Text>
          </View>
          <View className="w-2/3">
            <Text className="text-gray-800 font-medium">
              {`${(
                tenant?.property.rentDetails?.baseRent ?? 0) + 
                (tenant?.property.rentDetails?.charges ?? 0)
              }€` || t('profile.notProvided')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
