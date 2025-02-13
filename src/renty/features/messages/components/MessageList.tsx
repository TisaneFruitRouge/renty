"use client"

import { Message } from "@prisma/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { format } from "date-fns";

type MessageListProps = {
    messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                    <Avatar>
                        <AvatarFallback>
                            {getInitials(message.senderId)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold">
                                {message.senderId}
                            </span>
                            <span className="text-xs text-gray-500">
                                {format(new Date(message.createdAt), "p")}
                            </span>
                        </div>
                        <p className="text-gray-700">{message.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
