import { withAuth } from "@/lib/mobile-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

export const GET = withAuth(async (req: NextRequest) => {
    const id = req.nextUrl.pathname.split('/').pop();
    
    const channel = await prisma.channel.findUnique({
        where: { id },
        include: {
            property: true,
            participants: true,
            messages: true
        }
    });

    if (channel) {
        // Get unique sender IDs for each type
        const landlordIds = new Set(
            channel.messages
                .filter(msg => msg.senderType === 'LANDLORD')
                .map(msg => msg.senderId)
        );
        const tenantIds = new Set(
            channel.messages
                .filter(msg => msg.senderType === 'TENANT')
                .map(msg => msg.senderId)
        );

        // Fetch all users and tenants in bulk
        const [users, tenants] = await Promise.all([
            prisma.user.findMany({
                where: { id: { in: Array.from(landlordIds) } },
                select: { id: true, name: true, email: true }
            }),
            prisma.tenant.findMany({
                where: { id: { in: Array.from(tenantIds) } },
                select: { id: true, firstName: true, lastName: true, email: true }
            })
        ]);

        // Create lookup maps for quick access
        const userMap = new Map(users.map(user => [user.id, user]));
        const tenantMap = new Map(tenants.map(tenant => [tenant.id, tenant]));

        // Add sender to each message
        channel.messages = channel.messages.map(message => ({
            ...message,
            sender: message.senderType === 'LANDLORD'
                ? userMap.get(message.senderId)
                : tenantMap.get(message.senderId)
        }));
    }
    
    return NextResponse.json({ channel });
})