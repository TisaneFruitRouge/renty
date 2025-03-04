import { prisma } from "@/prisma/db";
import { Message, ParticipantType, tenant, user } from "@prisma/client";

// Create a new channel for a property
export async function createPropertyChannel(propertyId: string, landlordId: string) {
    
    const channel = await prisma.channel.create({
      data: {
        propertyId,
        type: 'PROPERTY',
        // Add landlord as participant
        participants: {
          create: {
            participantId: landlordId,
            participantType: 'LANDLORD'
          }
        }
      }
    });

    return channel;
}

export async function addTenantToPropertyChannel(propertyId: string, tenantId: string) {
    // First find the channel by propertyId
    const channel = await prisma.channel.findFirst({
      where: { propertyId }
    });

    if (!channel) {
      throw new Error(`No channel found for property ${propertyId}`);
    }

    // Then update the channel using its id
    return prisma.channel.update({
      where: { id: channel.id },
      data: {
        participants: {
          create: {
            participantId: tenantId,
            participantType: 'TENANT'
          }
        }
      }
    });
}

export type MessageWithSender = Message & {
  sender: tenant | user | null; // Adjust the type of sender based on your actual sender type, e.g., User or Tenant
}
export type UserWithType = (tenant & { participantType: "TENANT"}) | (user & { participantType: "LANDLORD"})

// Get all messages in a channel with participants
export async function getChannelMessages(channelId: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 50
      },
      participants: true,
      property: true,
    }
  });

  if (!channel) {
    return null; // or handle the case where the channel is not found
  }

  const messagesWithSender: MessageWithSender[] = await Promise.all(
    channel.messages.map(async (message) => {
      let sender: tenant | user | null;
      if (message.senderType === ParticipantType.LANDLORD) {
        sender = await prisma.user.findUnique({
          where: { id: message.senderId }
        });
      } else {
        sender = await prisma.tenant.findUnique({
          where: { id: message.senderId }
        });
      }
      return { ...message, sender };
    })
  );

  return { ...channel, messages: messagesWithSender };
}

export async function getChannelParticipants(channelId: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      participants: true,
    }
  });

  const participants = channel?.participants ?? [];

  const participantsWithDetails: UserWithType[] = [];

  for (const participant of participants) {
    if (participant.participantType === ParticipantType.LANDLORD) {
      const participantWithDetail = await prisma.user.findUnique({
        where: { id: participant.participantId }
      });
      if (participantWithDetail !== null) 
        participantsWithDetails.push({...participantWithDetail, participantType: participant.participantType});
    } else {
      const participantWithDetail = await prisma.tenant.findUnique({
        where: { id: participant.participantId }
      });
      if (participantWithDetail !== null) 
        participantsWithDetails.push({...participantWithDetail, participantType: participant.participantType});
    }
  }

  return participantsWithDetails;
}

export async function getChannelsOfUser(userId: string) {
    const channels = await prisma.channel.findMany({
      where: {
        participants: {
          some: {
            participantId: userId
          }
        }
      },
      include: {
        participants: true,
        property: true
      }
    });
    return channels;
}

export async function saveMessage(data: {
    channelId: string;
    senderId: string;
    senderType: ParticipantType;
    content: string;
}) {
    const message = await prisma.message.create({
        data: {
            channelId: data.channelId,
            senderId: data.senderId,
            senderType: data.senderType,
            content: data.content,
        }
    });
    return message;
}

export async function getChannelByPropertyId(propertyId: string) {
    const channel = await prisma.channel.findFirst({
        where: { 
            propertyId,
            type: 'PROPERTY'
        }
    });
    
    return channel;
}