import { channel, channelParticipant, property } from "@prisma/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

type ChannelHeaderProps = {
    channel: channel & {
        participants: channelParticipant[];
        property?: property;
    };
};

export function ChannelHeader({ channel }: ChannelHeaderProps) {
    const channelName = channel.property?.title || "Direct Message";

    return (
        <div className="border-b p-4 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold">{channelName}</h2>
                <p className="text-sm text-gray-500">
                    {channel.participants.length} participants
                </p>
            </div>
            <div className="flex -space-x-2">
                {channel.participants.map((participant) => (
                    <Avatar key={participant.participantId} className="border-2 border-white">
                        <AvatarFallback>
                            {getInitials(participant.id)}
                        </AvatarFallback>
                    </Avatar>
                ))}
            </div>
        </div>
    );
}
