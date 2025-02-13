"use client"

import { useState, useEffect } from "react";
import { AblyProvider, ChannelProvider, useChannel } from "ably/react";
import { createMessageAction } from "../actions";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatSkeleton } from "./ChatSkeleton";
import * as Ably from "ably";
import { ParticipantType, type Message } from "@prisma/client";

type ChannelChatProps = {
    apiKey: string;
    initialMessages: Message[];
    channelId: string;
    userId: string;
};

function ChatContent({ initialMessages, channelId, userId }: Omit<ChannelChatProps, 'apiKey'>) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);

    const { channel } = useChannel(`channel:${channelId}`, 'message', (message) => {
        const newMessage: Message = {
            id: message.id!,
            channelId: channelId,
            senderId: message.data.senderId,
            senderType: message.data.senderType,
            content: message.data.content,
            createdAt: new Date(message.data.timestamp)
        };
        setMessages(prev => [...prev, newMessage]);
    });

    const sendMessage = async (content: string) => {
        try {
            // First save to database
            const savedMessage = await createMessageAction({
                channelId,
                senderId: userId,
                senderType: ParticipantType.LANDLORD, // You might want to pass this as a prop
                content,
            });

            // Then publish to Ably
            await channel.publish('message', {
                id: savedMessage.id,
                content: savedMessage.content,
                senderId: savedMessage.senderId,
                senderType: savedMessage.senderType,
                timestamp: savedMessage.createdAt.toISOString(),
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    };

    return (
        <>
            <MessageList messages={messages} />
            <MessageInput onSendMessage={sendMessage} />
        </>
    );
}

export function ChannelChat({ apiKey, initialMessages, channelId, userId }: ChannelChatProps) {
    const [client, setClient] = useState<Ably.Realtime | null>(null);

    useEffect(() => {
        const ablyClient = new Ably.Realtime({
            key: apiKey,
            clientId: `${userId}-${Date.now()}`,
        });

        setClient(ablyClient);

        return () => {
            ablyClient.close();
        };
    }, [apiKey, userId]);

    if (!client) {
        return <ChatSkeleton />;
    }

    return (
        <AblyProvider client={client}>
            <ChannelProvider channelName={`channel:${channelId}`}>
                <ChatContent 
                    initialMessages={initialMessages}
                    channelId={channelId}
                    userId={userId}
                />
            </ChannelProvider>
        </AblyProvider>
    );
}
