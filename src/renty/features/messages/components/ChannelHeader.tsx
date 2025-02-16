import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { getChannelMessages, UserWithType } from "../db";
import { useTranslations } from "next-intl";
import { ParticipantType } from "@prisma/client";

type ChannelHeaderProps = {
    channel: Awaited<ReturnType<typeof getChannelMessages>>;
    channelParticipants: UserWithType[];
};

export function ChannelHeader({ channel, channelParticipants }: ChannelHeaderProps) {

    const t = useTranslations('messages')

    const channelName = channel!.property?.title || t('direct-messages');
    
    const participantsNames = channelParticipants.map((participant) => {
        if (participant.participantType === ParticipantType.LANDLORD) {
            return participant.name;
        } else {
            return participant.firstName;
        }
    });

    return (
        <div className="border-b p-4 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold">{channelName}</h2>
                <p className="text-sm text-gray-500">
                    {channelParticipants.length} {t('participants')}
                </p>
            </div>
            <div className="flex -space-x-2">
                {participantsNames.map((participant) => (
                    <Avatar key={participant} className="border-2 border-white">
                        <AvatarFallback>
                            {getInitials(participant)}
                        </AvatarFallback>
                    </Avatar>
                ))}
            </div>
        </div>
    );
}
