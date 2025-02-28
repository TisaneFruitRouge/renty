import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from './ui/text';
import { RentReceiptWithProperty } from '@/queries/rentReceipts';
import { RentReceiptStatus } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import { cn } from '@/lib/utils';

interface RentReceiptsProps {
  rentReceipts: RentReceiptWithProperty[];
}

const statusColors = {
  [RentReceiptStatus.PAID]: 'bg-emerald-500',
  [RentReceiptStatus.PENDING]: 'bg-amber-500',
  [RentReceiptStatus.LATE]: 'bg-red-500',
  [RentReceiptStatus.UNPAID]: 'bg-red-500',
  [RentReceiptStatus.CANCELLED]: 'bg-gray-500',
  [RentReceiptStatus.DRAFT]: 'bg-gray-500',
};

export function RentReceipts({ rentReceipts }: RentReceiptsProps) {
  const { t } = useTranslation();

  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Can't open this URL: ", url);
    }
  }

  return (
    <>
      {rentReceipts.map((receipt, index) => (
        <TouchableOpacity 
          key={receipt.id}
          activeOpacity={0.5} 
          onPress={() => openUrl(receipt.blobUrl ?? '')}
        >
          <View className={cn(
            "bg-white rounded-xl p-4",
            "border-b border-black/20",
            index === 0 && "last:border-t"
          )}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-semibold flex-1">
                {receipt.property.title}
              </Text>
              <View className={`px-2 py-1 rounded-full ${statusColors[receipt.status]}`}>
                <Text className="text-xs font-medium text-white">
                  {t(`rentReceipts.status.${receipt.status}`)}
                </Text>
              </View>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">{t('rentReceipts.period')} :</Text>
                <Text>
                  {format(new Date(receipt.startDate), 'd MMM', { locale: fr })} - {format(new Date(receipt.endDate), 'd MMM yyyy', { locale: fr })}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">{t('rentReceipts.amount')} :</Text>
                <Text className="font-medium">
                  {receipt.baseRent + receipt.charges} €
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}
