import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { reviveDates } from "@/lib/convex-map";
import { Message, ParticipantType, tenant, user } from "@prisma/client";

export async function createPropertyChannel(propertyId: string, landlordId: string) {
  const channel = await getConvexClient().mutation(api.channels.createPropertyChannel, {
    propertyId,
    landlordId,
  });
  return reviveDates(channel);
}

export async function addTenantToPropertyChannel(propertyId: string, tenantId: string) {
  const channel = await getConvexClient().mutation(api.channels.addTenantToPropertyChannel, {
    propertyId,
    tenantId,
  });
  return reviveDates(channel);
}

export type MessageWithSender = Message & {
  sender: tenant | user | null;
};
export type UserWithType =
  | (tenant & { participantType: "TENANT" })
  | (user & { participantType: "LANDLORD" });

export async function getChannelMessages(channelId: string) {
  const channel = await getConvexClient().query(api.channels.getMessages, { channelId });
  if (!channel) return null;
  const revived = reviveDates(channel);
  return revived as typeof revived & { messages: MessageWithSender[] };
}

export async function getChannelParticipants(channelId: string) {
  const participants = await getConvexClient().query(api.channels.getParticipants, { channelId });
  return reviveDates(participants) as unknown as UserWithType[];
}

export async function getChannelsOfUser(userId: string) {
  const channels = await getConvexClient().query(api.channels.listForUser, { userId });
  const revived = reviveDates(channels);
  return revived as Array<
    (typeof revived)[number] & { property: NonNullable<(typeof revived)[number]["property"]> }
  >;
}

export async function saveMessage(data: {
  channelId: string;
  senderId: string;
  senderType: ParticipantType;
  content: string;
}) {
  const message = await getConvexClient().mutation(api.channels.saveMessage, {
    channelId: data.channelId,
    senderId: data.senderId,
    senderType: data.senderType,
    content: data.content,
  });
  return reviveDates(message) as unknown as Message;
}

export async function getChannelByPropertyId(propertyId: string) {
  const channel = await getConvexClient().query(api.channels.getByPropertyId, { propertyId });
  return reviveDates(channel);
}
