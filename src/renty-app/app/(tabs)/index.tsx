import { Text } from '@/components/ui/text';
import '@/lib/i18n';
import { ScrollView, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getTenantRentReceipts } from '@/queries/rentReceipts';
import { RentReceipts } from '@/components/RentReceipts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomeScreen() {
  const { tenant } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  // Example query setup - replace with your actual data fetching
  const { data: rentReceipts, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => getTenantRentReceipts(tenant!.id),
    enabled: !!tenant?.id,
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: 'regular',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBackTitle: t('home.title'),
        }}
      />
      <ScrollView 
        className="flex-1 bg-background" 
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="px-4 pt-8 pb-4 space-y-4">
            <View className="space-y-4">
              <Text className="text-3xl font-bold">{t('home.welcome', { name: tenant?.firstName })}</Text>
              <Text>{[tenant?.property?.address, tenant?.property?.city, tenant?.property?.country].filter(Boolean).join(', ')}</Text>
            </View>
        </View>

        {/* Rent Receipts Section */}
        {isLoading ? (
          <Card className='m-4'>
            <CardHeader>
              <CardTitle>{t('rentReceipts.title')}</CardTitle>
            </CardHeader>
            <CardContent className='px-0'>
              {/* Skeleton loader for rent receipts */}
              {[1, 2, 3].map((_, index) => (
                <View key={index} className={`bg-white rounded-xl p-4 border-b border-black/20 ${index === 0 && "last:border-t"}`}>
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="bg-gray-200 h-5 w-40 rounded-md animate-pulse" />
                    <View className="bg-gray-200 h-6 w-20 rounded-full animate-pulse" />
                  </View>
                  
                  <View className="space-y-2">
                    <View className="flex-row justify-between items-center">
                      <View className="bg-gray-200 h-4 w-24 rounded-md animate-pulse" />
                      <View className="bg-gray-200 h-4 w-32 rounded-md animate-pulse" />
                    </View>
                    <View className="flex-row justify-between items-center">
                      <View className="bg-gray-200 h-4 w-24 rounded-md animate-pulse" />
                      <View className="bg-gray-200 h-4 w-16 rounded-md animate-pulse" />
                    </View>
                  </View>
                </View>
              ))}
            </CardContent>
            <CardFooter>
              <View className="bg-gray-200 h-10 w-full rounded-md animate-pulse" />
            </CardFooter>
          </Card>
        ) : error || !rentReceipts ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#EF4444' }}>{t('home.loadError')}</Text>
          </View>
        ) : (
          <Card className='m-4'>
            <CardHeader>
              <CardTitle>{t('rentReceipts.title')}</CardTitle>
            </CardHeader>
            <CardContent className='px-0'>
              <RentReceipts rentReceipts={rentReceipts.rentReceipts} />
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                onPress={() => router.push('/rent-receipts')}
                className='justify-center w-full'
              >
                <Text>{t('rentReceipts.viewAll')}</Text>
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Documents Section */}
        <Card className='m-4'>
          <CardHeader>
            <CardTitle>{t('documents.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className='text-muted-foreground'>{t('documents.description')}</Text>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              onPress={() => router.push('/documents')}
              className='justify-center w-full'
            >
              <Text>{t('documents.viewAll')}</Text>
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </>
  );
}