"use server"

import type { ParticipantType } from "@prisma/client";
import { saveMessage } from "./db";

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
