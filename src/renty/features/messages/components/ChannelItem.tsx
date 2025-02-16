import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { getChannelsOfUser } from "../db";

interface ChannelItemProps {
  channel: Awaited<ReturnType<typeof getChannelsOfUser>>[number];
}

export function ChannelItem({ channel }: ChannelItemProps) {
  const pathname = usePathname();

  return (
    <Link
      href={`/channels/${channel.id}`}
      className={cn(
        "relative flex flex-col gap-1 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        pathname === `/channels/${channel.id}` && "bg-accent text-accent-foreground",
        pathname === `/channels/${channel.id}` && "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-sm before:bg-primary"
      )}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium line-clamp-1">{channel.property.title}</h3>
      </div>
      <p className="line-clamp-1 text-xs text-muted-foreground">
        {channel.property.city}, {channel.property.state}, {channel.property.country}
      </p>
      {/* {channel.lastMessage && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p className="line-clamp-1">{channel.lastMessage.content}</p>
          <time className="ml-2 shrink-0">
            {new Intl.DateTimeFormat("fr", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(channel.lastMessage.timestamp)}
          </time>
        </div>
      )} */}
    </Link>
  );
}
