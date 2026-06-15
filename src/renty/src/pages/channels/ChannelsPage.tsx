import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { Home, Loader2, MessageCircle, Send } from "lucide-react";
import { useParams } from "react-router-dom";
import Link from "@/components/Link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/lib/i18n";
import { cn, getInitials } from "@/lib/utils";
import { ParticipantType } from "@/lib/types";
import { api } from "@/convex/_generated/api";
import { useCurrentUserId } from "../../lib/current-user";
import { reviveDates } from "../../lib/revive-dates";

type Participant = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  participantType: "LANDLORD" | "TENANT";
};

type Message = {
  id: string;
  content: string;
  channelId: string;
  senderId: string;
  senderType: "LANDLORD" | "TENANT";
  createdAt: Date;
  sender: Participant | null;
};

type Channel = {
  id: string;
  name?: string | null;
  property?: {
    id: string;
    title: string;
    address?: string;
    city?: string;
  } | null;
  messages?: Message[];
  participants?: Participant[];
};

function participantName(participant: Participant | null | undefined, fallback: string) {
  if (!participant) return fallback;
  if (participant.participantType === "LANDLORD") {
    return participant.name ?? participant.email ?? fallback;
  }
  return [participant.firstName, participant.lastName].filter(Boolean).join(" ") || participant.email || fallback;
}

function channelName(channel: Channel, fallback: string) {
  return channel.property?.title || channel.name || fallback;
}

function ChannelsEmptyState() {
  const t = useTranslations("messages");

  return (
    <div className="flex h-full min-h-[520px] flex-col items-center justify-center p-8 text-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{t("default-page.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("default-page.description")}</p>
        <Link href="/properties" className="mt-6">
          <Button>{t("default-page.go-to-properties")}</Button>
        </Link>
      </div>
    </div>
  );
}

function ChannelsSidebar({
  channels,
  selectedChannelId,
}: {
  channels: Channel[];
  selectedChannelId?: string;
}) {
  const t = useTranslations("messages");

  return (
    <aside className="flex h-full min-h-[calc(100vh-4rem)] w-full flex-col border-r bg-background md:w-[280px]">
      <div className="p-4">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="grid gap-1 p-2">
          {channels.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t("no-conversations")}
            </div>
          ) : (
            channels.map((channel) => {
              const active = channel.id === selectedChannelId;
              return (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.id}`}
                  className={cn(
                    "flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                    active && "bg-muted",
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {getInitials(channelName(channel, t("direct-messages")))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {channelName(channel, t("direct-messages"))}
                    </span>
                    {channel.property?.city && (
                      <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Home className="h-3 w-3" />
                        {channel.property.city}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function ChannelHeader({
  channel,
  participants,
}: {
  channel: Channel;
  participants: Participant[];
}) {
  const t = useTranslations("messages");

  return (
    <div className="flex items-center justify-between gap-4 border-b p-4">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold">
          {channelName(channel, t("direct-messages"))}
        </h2>
        <p className="text-sm text-muted-foreground">
          {participants.length} {t("participants")}
        </p>
      </div>
      <div className="flex -space-x-2">
        {participants.slice(0, 5).map((participant) => {
          const name = participantName(participant, t("unknown-sender"));
          return (
            <Avatar key={`${participant.participantType}-${participant.id}`} className="border-2 border-background">
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          );
        })}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  currentUserId,
}: {
  message: Message;
  currentUserId: string;
}) {
  const t = useTranslations("messages");
  const isMine = message.senderId === currentUserId;
  const senderName = participantName(message.sender, t("unknown-sender"));

  return (
    <div className={cn("group flex items-end gap-3", isMine && "flex-row-reverse")}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[78%] space-y-1", isMine && "items-end")}>
        <div className={cn("flex items-baseline gap-2 px-1", isMine && "flex-row-reverse")}>
          <span className="text-sm font-medium text-muted-foreground">
            {isMine ? t("you") : senderName}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {format(message.createdAt, "HH:mm")}
          </span>
        </div>
        <div
          className={cn(
            "whitespace-pre-line break-words rounded-md px-4 py-2 text-sm",
            isMine
              ? "rounded-br-none bg-primary text-primary-foreground"
              : "rounded-bl-none bg-muted",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function MessageInput({
  disabled,
  onSend,
}: {
  disabled?: boolean;
  onSend: (content: string) => Promise<void>;
}) {
  const t = useTranslations("messages");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendCurrentMessage = async () => {
    const content = message.trim();
    if (!content || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(content);
      setMessage("");
      textareaRef.current?.focus();
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendCurrentMessage();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-stretch gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendCurrentMessage();
            }
          }}
          placeholder={t("input.placeholder")}
          className="min-h-12 resize-none"
          rows={1}
          disabled={disabled || isSending}
        />
        <Button type="submit" disabled={!message.trim() || disabled || isSending} className="h-auto px-3">
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}

function ChannelDetail({
  channelId,
  currentUserId,
}: {
  channelId: string;
  currentUserId: string;
}) {
  const t = useTranslations("messages");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rawChannel = useQuery(
    api.channels.getMessages,
    currentUserId ? { channelId, userId: currentUserId } : "skip",
  );
  const rawParticipants = useQuery(
    api.channels.getParticipants,
    currentUserId ? { channelId, userId: currentUserId } : "skip",
  );
  const saveMessage = useMutation(api.channels.saveMessage);

  const channel = useMemo(() => reviveDates(rawChannel) as Channel | null | undefined, [rawChannel]);
  const participants = useMemo(
    () => reviveDates(rawParticipants ?? []) as Participant[],
    [rawParticipants],
  );
  const messages = channel?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (channel === undefined || rawParticipants === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="max-w-md p-6 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">{t("no-conversations")}</p>
        </Card>
      </div>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col">
      <ChannelHeader channel={channel} participants={participants} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} currentUserId={currentUserId} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <MessageInput
        onSend={(content) =>
          saveMessage({
            channelId: channel.id,
            senderId: currentUserId,
            senderType: ParticipantType.LANDLORD,
            content,
          }).then(() => undefined)
        }
      />
    </section>
  );
}

export function ChannelsPage() {
  const t = useTranslations("messages");
  const { id } = useParams();
  const currentUserId = useCurrentUserId();
  const rawChannels = useQuery(
    api.channels.listForUser,
    currentUserId ? { userId: currentUserId } : "skip",
  );
  const channels = useMemo(() => reviveDates(rawChannels ?? []) as Channel[], [rawChannels]);

  if (!currentUserId || rawChannels === undefined) {
    return (
      <div className="flex min-h-[520px] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (channels.length === 0) {
    return <ChannelsEmptyState />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      <ChannelsSidebar channels={channels} selectedChannelId={id} />
      {id ? (
        <ChannelDetail channelId={id} currentUserId={currentUserId} />
      ) : (
        <div className="hidden flex-1 items-center justify-center p-8 md:flex">
          <Card className="max-w-md p-6 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">{t("default-page.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("default-page.empty-state")}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
