"use client"

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createMessageAction } from "../actions";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ParticipantType, user } from "@/lib/types";
import { MessageWithSender } from "../db";
 

type ChannelChatProps = {
    initialMessages: MessageWithSender[];
    channelId: string;
    user: user;
};

function reviveMessageDates(messages: MessageWithSender[]) {
    return messages.map((message) => ({
        ...message,
        createdAt: new Date(message.createdAt),
    }));
}

export function ChannelChat({ initialMessages, channelId, user }: ChannelChatProps) {
    const liveChannel = useQuery(api.channels.getMessages, { channelId });
    const messages = useMemo(
        () => reviveMessageDates((liveChannel?.messages ?? initialMessages) as MessageWithSender[]),
        [initialMessages, liveChannel?.messages],
    );

    const sendMessage = async (content: string) => {
        try {
            await createMessageAction({
                channelId,
                senderId: user.id,
                senderType: ParticipantType.LANDLORD,
                content,
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
