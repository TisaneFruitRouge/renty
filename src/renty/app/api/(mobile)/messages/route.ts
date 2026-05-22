import { withAuth } from "@/lib/mobile-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/convex-prisma";
import { ParticipantType } from "@prisma/client";

export const POST = withAuth(async (req: NextRequest, tenantId) => {
    const {
        content,
        createdAt,
        channelId
    } = await req.json();

    const message = await db.message.create({
        data: {
            content,
            senderId: tenantId,
            createdAt,
            channelId,
            senderType: ParticipantType.TENANT,
        }
    });

    // Get the sender information
    const sender = await db.tenant.findUnique({
        where: { id: tenantId }
    });

    const messageWithSender = { ...message, sender };

    return NextResponse.json({ message: messageWithSender });
})