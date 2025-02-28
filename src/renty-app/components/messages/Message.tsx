import { Text, View } from "react-native";
import { MessageWithSender, Tenant, User } from "@/lib/types";
import { ParticipantType } from "@/lib/types";

type MessageProps = {
    message: MessageWithSender;
    currentUserId: string;
};

export function Message({ message, currentUserId }: MessageProps) {
    const isCurrentUser = message.senderId === currentUserId;

    const getSenderName = (message: MessageWithSender) => {
        if (message.sender === null) return "Unknown";
    
        if (message.senderType === ParticipantType.LANDLORD) {
            return (message.sender as User).name;
        } else {
            const tenant = message.sender as Tenant;
            return `${tenant.firstName} ${tenant.lastName}`;
        }
    }

    return (
        <View
            className={`flex-row ${isCurrentUser ? "justify-end" : "justify-start"}`}
        >
            <View className="max-w-[85%] space-y-1">
                {!isCurrentUser && (
                    <Text className="text-xs text-muted-foreground mx-1">
                        {getSenderName(message)}
                    </Text>
                )}
                <View
                    className={`p-3.5 rounded-2xl ${
                        isCurrentUser
                            ? "bg-primary rounded-tr-lg"
                            : "bg-secondary rounded-tl-lg"
                    }`}
                >
                    <Text
                        className={`text-base ${
                            isCurrentUser
                                ? "text-primary-foreground"
                                : "text-foreground"
                        }`}
                    >
                        {message.content}
                    </Text>
                </View>
                <Text className="text-xs text-muted-foreground mx-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>
        </View>
    );
}
