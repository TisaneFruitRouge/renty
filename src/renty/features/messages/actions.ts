"use server"

import type { ParticipantType } from "@prisma/client";
import { saveMessage, getChannelByPropertyId } from "./db";

export async function createMessageAction(data: {
    channelId: string;
    senderId: string;
    senderType: ParticipantType;
    content: string;
}) {
    try {
        const message = await saveMessage(data);
        return message;
    } catch (error) {
        console.error("Failed to save message:", error);
        throw new Error("Failed to save message");
    }
}

export async function getChannelByPropertyIdAction(propertyId: string) {
    try {
        const channel = await getChannelByPropertyId(propertyId);
        return { success: true, data: channel };
    } catch (error) {
        console.error("Failed to get channel for property:", error);
        return { success: false, error: "Failed to get channel for property" };
    }
}
