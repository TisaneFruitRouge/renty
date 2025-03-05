import { Text } from '@/components/ui/text';
import { useState, useCallback } from 'react';
import { ScrollView, View, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchChannelsOfTenant } from '@/queries/channels';
import { Channel, ChannelType } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Function to get a consistent color based on a string
const getColorFromString = (str: string) => {
  const colors = [
    'bg-muted', 'bg-slate-100', 'bg-gray-100', 'bg-zinc-100',
    'bg-stone-100', 'bg-neutral-100'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Function to get icon based on channel type
const getChannelIcon = (type: ChannelType) => {
  switch (type) {
    case ChannelType.MAINTENANCE:
      return 'wrench';  // Maintenance icon
    case ChannelType.PAYMENT:
      return 'receipt';  // Payment icon
    case ChannelType.CUSTOM:
      return 'chat';  // Custom conversation icon
    default:
      return 'house.fill';  // Property/default icon
  }
};

// Function to get icon color based on channel type
const getIconColor = (type: ChannelType) => {
  switch (type) {
    case ChannelType.MAINTENANCE:
      return '#0891b2';  // cyan-600 - matches app accent color
    case ChannelType.PAYMENT:
      return '#0f766e';  // teal-700
    case ChannelType.CUSTOM:
      return '#4b5563';  // gray-600
    default:
      return '#4b5563';  // gray-600
  }
};

export default function MessagesScreen() {
  const { tenant } = useAuth();
  const { t } = useTranslation('messages');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['channels'],
    queryFn: () => fetchChannelsOfTenant(tenant?.id as string),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const lastMessage = (channel: Channel) => {
    const messages = channel.messages;
    if (messages.length === 0) {
      return null;
    }

    return messages[messages.length - 1];
  };

  const formatTimestamp = (date: Date) => {
    const _date = new Date(date);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // Same day - show time
    if (_date.toDateString() === now.toDateString()) {
      return _date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } 
    // Yesterday - show "Yesterday"
    else if (_date.toDateString() === yesterday.toDateString()) {
      return t('messages.yesterday');
    } 
    // This week - show day name
    else if (now.getTime() - _date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return _date.toLocaleDateString([], { weekday: 'short' });
    } 
    // Older - show date
    else {
      return _date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  };
  
  const renderChannelAvatar = (channel: Channel) => {
    const colorClass = getColorFromString(channel.id);
    const iconName = getChannelIcon(channel.type);
    const iconColor = getIconColor(channel.type);
    
    return (
      <View className={`w-14 h-14 rounded-lg ${colorClass} items-center justify-center border border-border/50`}>
        <IconSymbol name={iconName as any} size={24} color={iconColor} />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!isLoading && (!data?.channels || data.channels.length === 0)) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <View className="w-16 h-16 rounded-lg bg-muted items-center justify-center mb-4 border border-border/50">
            <IconSymbol name="doc.text" size={28} color="#4b5563" />
          </View>
          <Text className="text-lg font-semibold text-center mb-2">{t('messages.noMessages')}</Text>
          <Text className="text-muted-foreground text-center px-8 mb-6">{t('messages.noMessagesDescription')}</Text>
        </View>
      );
    }
    return null;
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderEmptyState()}
        
        <View className="px-4 pt-2 pb-4 flex flex-col gap-3">
          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <View 
                key={index}
                className="flex-row items-center p-4 bg-white rounded-xl border border-black/20"
              >
                <View className="w-14 h-14 rounded-lg bg-gray-200 animate-pulse border border-border/50" />
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                    <View className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                  </View>
                  <View className="w-56 h-4 bg-gray-200 rounded animate-pulse" />
                </View>
              </View>
            ))
          ) : (
            data?.channels?.map((channel) => { 
              const _lastMessage = lastMessage(channel);
              const hasUnread = Math.random() < 0.3; // Simulating unread messages for demo
              
              return (
                <Link key={channel.id} href={`/chat/${channel.id}`} asChild>
                  <TouchableOpacity 
                    className="flex-row items-center p-4 bg-white rounded-xl border border-black/20 active:opacity-80"
                    activeOpacity={0.9}
                  >
                    {renderChannelAvatar(channel)}
                    
                    <View className="flex-1 ml-4">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className={`text-base ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
                          {channel.name || channel.property.title}
                        </Text>
                        {_lastMessage !== null && (
                          <Text className={`text-xs ${hasUnread ? 'text-cyan-600 font-medium' : 'text-muted-foreground'}`}>
                            {formatTimestamp(_lastMessage.createdAt)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row justify-between items-center">
                        {_lastMessage !== null ? (
                          <Text 
                            className={`text-sm ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'} flex-1 mr-2`}
                            numberOfLines={1}
                          >
                            {_lastMessage.content}
                          </Text>
                        ) : (
                          <Text className="text-sm text-muted-foreground italic">
                            {t('messages.noMessagesYet')}
                          </Text>
                        )}
                        {hasUnread && (
                          <View className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              );
            })
          )}
        </View>
      </ScrollView>
    </>
  );
}
