import { ChannelsLayoutClient } from "@/features/messages/components/ChannelsLayoutClient";
import { getChannelsOfUser } from "@/features/messages/db";
import { getSession } from "@/lib/session";

export default async function ChannelsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await getSession();

    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const channels = await getChannelsOfUser(session.user.id)

    return (
        <ChannelsLayoutClient channels={channels}>
            {children}
        </ChannelsLayoutClient>
    )
}
