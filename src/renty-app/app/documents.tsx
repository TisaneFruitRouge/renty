import { Text } from '@/components/ui/text';
import '@/lib/i18n';
import { ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getPropertyDocuments } from '@/queries/documents';
import { Documents } from '@/components/Documents';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentWithProperty } from '@/queries/documents';

// Document categories based on the database enum
const DOCUMENT_CATEGORIES = [
  'ALL',
  'LEASE',
  'INVENTORY',
  'INSURANCE',
  'MAINTENANCE',
  'PAYMENT',
  'CORRESPONDENCE',
  'LEGAL',
  'UTILITY',
  'OTHER'
];

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const { tenant } = useAuth();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', tenant?.propertyId],
    queryFn: () => getPropertyDocuments(tenant!.propertyId!),
    enabled: !!tenant?.propertyId,
  });
  
  // Simple filtering function that works with exact category matches
  const filteredDocuments = useCallback(() => {
    if (!data?.documents) return [];
    
    if (selectedCategory === 'ALL') {
      return data.documents;
    }
    
    return data.documents.filter(doc => doc.category === selectedCategory);
  }, [data?.documents, selectedCategory]);
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t('documents.allDocuments'),
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
          <View className="flex-1 items-center justify-center p-12">
            <ActivityIndicator size="large" color="#0891b2" />
            <Text className="mt-4 text-muted-foreground">{t('common.loading')}</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center p-8">
            <View className="bg-red-50 p-4 rounded-xl items-center">
              <IconSymbol name="exclamationmark.triangle" size={40} color="#ef4444" />
              <Text className="text-red-500 font-medium mt-2 text-center">{t('common.error')}</Text>
              <Text className="text-red-400 text-sm mt-1 text-center">
                {error instanceof Error ? error.message : t('common.unknownError')}
              </Text>
              <Button 
                variant="outline" 
                className="mt-4 border-red-300"
                onPress={() => navigation.goBack()}
              >
                <Text className="text-red-500">{t('common.goBack')}</Text>
              </Button>
            </View>
          </View>
        ) : !data?.documents || data.documents.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <IconSymbol name="doc.text" size={50} color="#9ca3af" />
            <Text className="text-center text-muted-foreground mt-4">
              {t('documents.noDocuments')}
            </Text>
          </View>
        ) : filteredDocuments().length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <IconSymbol name="doc.text" size={50} color="#9ca3af" />
            <Text className="text-center text-muted-foreground mt-4">
              {t('documents.noDocumentsInCategory')}
            </Text>
          </View>
        ) : (
          <Documents documents={filteredDocuments()} />
        )}
      </ScrollView>
    </>
  );
}
