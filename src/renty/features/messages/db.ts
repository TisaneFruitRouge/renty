import { prisma } from "@/prisma/db";
import { ParticipantType } from "@prisma/client";

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
  
// Get all messages in a channel with participants
export async function getChannelMessages(channelId: string) {
    const messages = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        participants: true
      }
    });
    return messages;
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