"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { getChannelsOfUser } from "../db";
import { ChannelItem } from "./ChannelItem";
import { useTranslations } from "next-intl";

interface ChannelsSidebarProps {
  channels: Awaited<ReturnType<typeof getChannelsOfUser>>;
}

export function ChannelsSidebar({ channels }: ChannelsSidebarProps) {
  const t = useTranslations("messages");

  return (
    <div className="flex h-full w-[240px] flex-col gap-4 border-r bg-background p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
      </div>
      <Separator className="-mx-4" />
      <ScrollArea className="flex-1 -mx-4">
        <div className="grid gap-1 p-2">
          {channels.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t("no-conversations")}
            </div>
          ) : (
            channels.map((channel) => (
              <ChannelItem key={channel.id} channel={channel} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
