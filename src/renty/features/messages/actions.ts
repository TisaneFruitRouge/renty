"use server"

import { saveMessage } from "./db";

export async function createMessageAction(data: {
    channelId: string;
    senderId: string;
    senderType: string;
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
