import { Text } from '@/components/ui/text';
import { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchChannelsOfTenant } from '@/queries/channels';
import { Channel } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export default function MessagesScreen() {
  const { tenant } = useAuth();
  const { t } = useTranslation('messages');

  const { data, isLoading, error } = useQuery({
    queryKey: ['channels'],
    queryFn: () => fetchChannelsOfTenant(tenant?.id as string),
  });

  const lastMessage = (channel: Channel) => {
    const messages = channel.messages;
    if (messages.length === 0) {
      return null
    }

    return messages[messages.length - 1];
  }

  const formatTimestamp = (date: Date) => {
    const _date = new Date(date);
    return _date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t('messages.title'),
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: 'regular',
          headerBackTitle: t('messages.title'),
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerSearchBarOptions: {
            placeholder: t('messages.search'),
          },
        }}
      />
      <ScrollView 
        className="flex-1 bg-background" 
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="px-4 pt-2 pb-4 flex flex-col gap-4">
          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <View 
                key={index}
                className="flex-row items-center p-3 bg-card/50 rounded-2xl border border-border/50"
              >
                <View className="w-14 h-14 rounded-xl bg-muted animate-pulse" />
                <View className="flex-1 ml-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <View className="w-24 h-5 bg-muted rounded animate-pulse" />
                    <View className="w-12 h-4 bg-muted rounded animate-pulse" />
                  </View>
                  <View className="w-48 h-4 bg-muted rounded animate-pulse mt-2" />
                </View>
              </View>
            ))
          ) : (
            data?.channels?.map((channel) => { 
              const _lastMessage = lastMessage(channel);
              return (
                <Link key={channel.id} href={`/chat/${channel.id}`} asChild>
                  <TouchableOpacity 
                    className="flex-row items-center p-3 bg-card/50 rounded-2xl border border-border/50 active:opacity-80"
                    activeOpacity={0.9}
                  >
                    <View className="flex-1 ml-3">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-base font-semibold">
                          {channel.name || channel.property.title}
                        </Text>
                        {_lastMessage !== null && (
                          <Text className="text-xs text-muted-foreground">
                            {formatTimestamp(_lastMessage.createdAt)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row justify-between items-center">
                        {_lastMessage !== null && (
                          <Text 
                            className="text-sm text-muted-foreground flex-1 mr-2"
                            numberOfLines={1}
                          >
                            {_lastMessage.content}
                          </Text>
                        )}
                        {false && (
                          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              )
            })
          )}
        </View>
      </ScrollView>
    </>
  );
}
