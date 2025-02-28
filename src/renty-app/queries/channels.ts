import { api } from "@/lib/api";
import { Channel, ChannelParticipant, Message, MessageWithSender, Property } from "@/lib/types";

export async function fetchChannelsOfTenant(tenantId: string) {
    const response = await api.get(`/api/channels?tenantId=${tenantId}`);
    return response.data as { 
        channels: (Channel & 
            { 
                property: Property, 
                participants: ChannelParticipant[], 
                messages: Message[] 
            }
        )[] 
    };
}

export async function fetchChannel(channelId: string) {
    const response = await api.get(`/api/channels/${channelId}`);
    return response.data as {
        channel: Channel & 
        { 
            property: Property, 
            participants: ChannelParticipant[], 
            messages: MessageWithSender[] 
        }
    };
}

export async function sendMessage(channelId: string, content: string) {
    const response = await api.post('/api/messages', {
        channelId,
        createdAt: new Date(),
        content,
    });

    return response.data as { message: MessageWithSender };
}