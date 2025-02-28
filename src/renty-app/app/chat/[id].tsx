import { useState, useMemo, useRef, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Input } from '@/components/ui/input';
import { Stack, useNavigation } from 'expo-router';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useQuery } from '@tanstack/react-query';
import { fetchChannel, sendMessage } from '@/queries/channels';
import { useAuth } from '@/hooks/useAuth';
import { Channel, MessageWithSender } from '@/lib/types';
import { Message as MessageComponent } from '@/components/messages/Message';

import * as Ably from 'ably';
import { AblyProvider, useChannel, ChannelProvider } from 'ably/react';
import { ABLY_API_KEY } from '@/constants/config';

interface MessageListProps {
  messages: MessageWithSender[];
  userId: string;
  scrollViewRef: React.RefObject<ScrollView>;
}

function MessageList({ messages, userId, scrollViewRef }: MessageListProps) {
  return (
    <ScrollView 
      ref={scrollViewRef}
      className="flex-1 px-4 pt-2" 
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="pb-4 space-y-3">
        {messages.map((msg) => (
          <MessageComponent
            key={msg.id}
            message={msg}
            currentUserId={userId}
          />
        ))}
      </View>
    </ScrollView>
  );
}

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
}

function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    await onSend(message.trim());
    setMessage('');
  };

  return (
    <BlurView intensity={80} className="border-t border-border pb-4">
      <View className="p-4 flex flex-row gap-4 items-end">
        <Input
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          className="flex-1 bg-card/50 border-border/50 rounded-2xl px-4 py-2.5"
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim()}
          className={`p-2.5 rounded-xl ${message.trim() 
            ? 'bg-primary active:opacity-80' 
            : 'bg-muted'}`}
        >
          <IconSymbol 
            name="arrow.up" 
            size={20} 
            color={'white'} 
          />
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

function ChatContent({ chatChannel, initialMessages }: { chatChannel: Channel, initialMessages: MessageWithSender[] }) {
  const { tenant } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const { channel } = useChannel(`channel:${chatChannel.id}`, (message) => {
    const newMessage: MessageWithSender = {
      id: message.id!,
      channelId: chatChannel.id,
      channel: chatChannel,
      senderId: message.data.senderId,
      senderType: message.data.senderType,
      content: message.data.content,
      createdAt: new Date(),
      sender: message.data.sender
    }
    
    // Optimistically update the UI
    setMessages(prev => [...prev, newMessage]);
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async (content: string) => {
    try {
      const { message } = await sendMessage(chatChannel.id, content);
      // Publish to Ably to notify other users
      await channel.publish('message', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <Stack.Screen
        options={{
          headerTitle: chatChannel.property.title,
          headerTransparent: true,
          headerBlurEffect: 'regular',
          headerBackTitle: 'Messages',
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
      <MessageList 
        messages={messages} 
        userId={tenant?.id!}
        scrollViewRef={scrollViewRef}
      />
      <MessageInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tenant } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['channels', id],
    queryFn: () => fetchChannel(id),
  });

  const client = useMemo(() => new Ably.Realtime({ 
    key: ABLY_API_KEY, 
    clientId: tenant!.id 
  }), [tenant!.id]);
  
  if (isLoading) {
    return (
      <View className="flex-1 px-4 pt-2">
        <View className="pb-4 space-y-3">
          {[...Array(3)].map((_, index) => (
            <View
              key={index}
              className={`flex-row ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <View className="max-w-[85%]">
                <View
                  className={`rounded-2xl ${index % 2 === 0
                    ? 'bg-card/50 rounded-tl-md'
                    : 'bg-primary/50 rounded-tr-md'}`}
                >
                  <View className="h-6 w-32 m-3.5 rounded animate-pulse bg-muted" />
                </View>
                <View className="h-3 w-16 mt-1 mx-1 rounded animate-pulse bg-muted" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={`channel:${id}`}>
        <ChatContent 
          chatChannel={data?.channel!}
          initialMessages={data?.channel?.messages || []}
        />
      </ChannelProvider>
    </AblyProvider>
  );
}
