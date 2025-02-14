import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getChannelMessages, getChannelParticipants } from "@/features/messages/db";
import { ChannelHeader } from "@/features/messages/components/ChannelHeader";
import { ChannelChat } from "@/features/messages/components/ChannelChat";
import type { user } from "@prisma/client";

type ChannelProps = {
    params: {
        id: string;
    };
};

export default async function Channel({ params }: ChannelProps) {
    const { id } = params;
    
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const channel = await getChannelMessages(id);

    if (!channel) {
        throw new Error("Channel not found");
    }

    const channelParticipants = await getChannelParticipants(channel.id);

    return (
        <div className="flex flex-col h-full">
            <ChannelHeader 
                channel={channel} 
                channelParticipants={channelParticipants}
            />
            <ChannelChat 
                apiKey={process.env.ABLY_API_KEY!}
                initialMessages={channel.messages}
                channelId={channel.id}
                user={session.user as unknown as user}
            />
        </div>
    );
}