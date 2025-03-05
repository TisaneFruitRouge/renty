import { Text } from '@/components/ui/text';
import '@/lib/i18n';
import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getTenantRentReceipts } from '@/queries/rentReceipts';
import { RentReceipts } from '@/components/RentReceipts';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function RentReceiptsScreen() {
  const { t } = useTranslation();
  const { tenant } = useAuth();
  const navigation = useNavigation();

  const { data: rentReceipts, isLoading, error } = useQuery({
    queryKey: ['rentReceipts', tenant?.id],
    queryFn: () => getTenantRentReceipts(tenant!.id),
    enabled: !!tenant?.id,
  });
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t('rentReceipts.allReceipts'),
          headerTransparent: true,
          headerBlurEffect: 'regular',
          headerBackTitle: 'Home',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="-ml-1 p-2 rounded-full active:bg-muted"
            >
              <IconSymbol name="chevron.left" size={20} color="black" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <ScrollView 
        className="flex-1 bg-background" 
        contentInsetAdjustmentBehavior="automatic"
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text>{t('common.loading')}</Text>
          </View>
        ) : error || !rentReceipts ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-red-500">{t('common.error')}</Text>
          </View>
        ) : (
          <RentReceipts rentReceipts={rentReceipts.rentReceipts} />
        )}
      </ScrollView>
    </>
  );
}
