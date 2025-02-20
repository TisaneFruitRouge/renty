import { withAuth } from "@/lib/mobile-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { ParticipantType } from "@prisma/client";

export const POST = withAuth(async (req: NextRequest, tenantId) => {
    const {
        content,
        createdAt,
        channelId
    } = await req.json();

    const message = await prisma.message.create({
        data: {
            content,
            senderId: tenantId,
            createdAt,
            channelId,
            senderType: ParticipantType.TENANT,
        }
    });

    // Get the sender information
    const sender = await prisma.tenant.findUnique({
        where: { id: tenantId }
    });

    const messageWithSender = { ...message, sender };

    return NextResponse.json({ message: messageWithSender });
})