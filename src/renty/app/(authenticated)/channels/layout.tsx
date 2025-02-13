import { ChannelsSidebar } from "@/features/messages/components/ChannelsSidebar";
import { getChannelsOfUser } from "@/features/messages/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ChannelsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const session = await auth.api.getSession({
        headers: await headers()
      });

    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const channels = await getChannelsOfUser(session.user.id)

    return (
        <div className="flex h-screen">
            <ChannelsSidebar channels={channels} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}