import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getChannelMessages } from "@/features/messages/db";
import { ChannelHeader } from "@/features/messages/components/ChannelHeader";
import { ChannelChat } from "@/features/messages/components/ChannelChat";

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

    return (
        <div className="flex flex-col h-full">
            <ChannelHeader channel={channel} />
            <ChannelChat 
                apiKey={process.env.ABLY_API_KEY!}
                initialMessages={channel.messages}
                channelId={channel.id}
                userId={session.user.id}
            />
        </div>
    );
}