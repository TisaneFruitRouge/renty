"use client"

import { useEffect, useRef } from "react";
import type { MessageWithSender } from "../db";
import { Message } from "./Message";

type MessageListProps = {
    messages: MessageWithSender[];
    currentUserId: string;
};

export function MessageList({ messages, currentUserId }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll when messages change or component mounts

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 w-full max-w-full">
            {messages.map((message) => (
                <Message
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
