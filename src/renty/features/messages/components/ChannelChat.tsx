"use client"

import { useState, useEffect } from "react";
import { AblyProvider, ChannelProvider, useChannel } from "ably/react";
import { createMessageAction } from "../actions";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatSkeleton } from "./ChatSkeleton";
import * as Ably from "ably";
import { ParticipantType, user } from "@prisma/client";
import { MessageWithSender } from "../db";
 

type ChannelChatProps = {
    apiKey: string;
    initialMessages: MessageWithSender[];
    channelId: string;
    user: user;
};

function ChatContent({ initialMessages, channelId, user }: Omit<ChannelChatProps, 'apiKey'>) {
    const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);

    const { channel } = useChannel(`channel:${channelId}`, 'message', (message) => {
        const newMessage: MessageWithSender = {
            id: message.id!,
            channelId: channelId,
            senderId: message.data.senderId,
            senderType: message.data.senderType,
            content: message.data.content,
            createdAt: new Date(message.data.timestamp),
            sender: user
        };
        setMessages(prev => [...prev, newMessage]);
    });

    const sendMessage = async (content: string) => {
        try {
            // First save to database
            const savedMessage = await createMessageAction({
                channelId,
                senderId: user.id,
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
            <MessageList messages={messages} currentUserId={user.id} />
            <MessageInput onSendMessage={sendMessage} />
        </>
    );
}

export function ChannelChat({ apiKey, initialMessages, channelId, user }: ChannelChatProps) {
    const [client, setClient] = useState<Ably.Realtime | null>(null);

    useEffect(() => {
        const ablyClient = new Ably.Realtime({
            key: apiKey,
            clientId: `${user.id}-${Date.now()}`,
        });

        setClient(ablyClient);

        return () => {
            ablyClient.close();
        };
    }, [apiKey, user.id]);

    if (!client) {
        return <ChatSkeleton />;
    }

    return (
        <AblyProvider client={client}>
            <ChannelProvider channelName={`channel:${channelId}`}>
                <ChatContent 
                    initialMessages={initialMessages}
                    channelId={channelId}
                    user={user}
                />
            </ChannelProvider>
        </AblyProvider>
    );
}
