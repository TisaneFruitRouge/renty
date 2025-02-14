"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { format } from "date-fns";
import type { MessageWithSender } from "../db";
import { ParticipantType, tenant, user } from "@prisma/client";
import { useTranslations } from "next-intl";

type MessageListProps = {
    messages: MessageWithSender[];
    currentUserId: string;
};

export function MessageList({ messages, currentUserId }: MessageListProps) {

    const t = useTranslations('messages');

    const getSenderName = (message: MessageWithSender) => {
        if (message.sender === null) return t('unknown-sender');
    
        if (message.senderType === ParticipantType.LANDLORD) {
            // Assuming LANDLORD corresponds to a 'user' with a 'name' property
            return (message.sender as user).name;
        } else {
            // Assuming TENANT corresponds to a 'tenant' with 'firstName' and 'lastName'
            const tenant = message.sender as tenant;
            return `${tenant.firstName} ${tenant.lastName}`;
        }
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-full">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn("flex gap-3", 
                        message.senderId === currentUserId && "flex-row-reverse",
                        message.senderId !== currentUserId && "flex-row"
                    )}
                >
                    <Avatar>
                        <AvatarFallback>
                            {getInitials(getSenderName(message))}
                        </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[60%]">
                        <div className={cn("flex items-baseline gap-2",
                            message.senderId === currentUserId && "justify-end",
                            message.senderId !== currentUserId && "justify-start"
                        )}>
                            <span className="font-semibold">
                                {message.senderId === currentUserId ? t('you') : getSenderName(message)}
                            </span>
                            <span className="text-xs text-gray-500">
                                {format(new Date(message.createdAt), "p")}
                            </span>
                        </div>
                        <p className={cn("text-gray-700 whitespace-pre-line break-words",
                            message.senderId === currentUserId && "text-end",
                            message.senderId !== currentUserId && "text-start"
                        )}>
                            {message.content}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
