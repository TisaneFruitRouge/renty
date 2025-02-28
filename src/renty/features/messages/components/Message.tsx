"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import type { MessageWithSender } from "../db";
import { ParticipantType, tenant, user } from "@prisma/client";

type MessageProps = {
    message: MessageWithSender;
    currentUserId: string;
};

export function Message({ message, currentUserId }: MessageProps) {
    const t = useTranslations('messages');

    const getSenderName = (message: MessageWithSender) => {
        if (message.sender === null) return t('unknown-sender');
    
        if (message.senderType === ParticipantType.LANDLORD) {
            return (message.sender as user).name;
        } else {
            const tenant = message.sender as tenant;
            return `${tenant.firstName} ${tenant.lastName}`;
        }
    }

    return (
        <div
            className={cn("group flex gap-3 items-end animate-in slide-in-from-bottom-2",
                message.senderId === currentUserId && "flex-row-reverse",
                message.senderId !== currentUserId && "flex-row"
            )}
        >
            <Avatar className="h-8 w-8 transition-transform duration-200 group-hover:scale-110">
                <AvatarFallback className="text-sm">
                    {getInitials(getSenderName(message))}
                </AvatarFallback>
            </Avatar>
            <div className={cn("max-w-[60%] space-y-1 overflow-hidden",
                message.senderId === currentUserId && "items-end",
                message.senderId !== currentUserId && "items-start"
            )}>
                <div className={cn("flex items-baseline gap-2 px-1",
                    message.senderId === currentUserId && "flex-row-reverse",
                    message.senderId !== currentUserId && "flex-row"
                )}>
                    <span className="text-sm font-medium text-gray-600">
                        {message.senderId === currentUserId ? t('you') : getSenderName(message)}
                    </span>
                    <span className="text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                        {format(message.createdAt, "p")}
                    </span>
                </div>
                <div className={cn("relative break-words",
                    message.senderId === currentUserId && "ml-4",
                    message.senderId !== currentUserId && "mr-4"
                )}>
                    <div className={cn("px-4 py-2 rounded-2xl shadow-sm",
                        message.senderId === currentUserId 
                            ? "bg-primary text-primary-foreground rounded-br-none" 
                            : "bg-muted rounded-bl-none"
                    )}>
                        <p className="whitespace-pre-line text-sm break-all overflow-wrap-anywhere">
                            {message.content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
