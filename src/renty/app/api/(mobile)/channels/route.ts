import { withAuth } from "@/lib/mobile-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";

export const GET = withAuth(async (req: NextRequest, tenantId: string) => {
    const channels = await prisma.channel.findMany({
        where: { 
            participants: {
                some: {
                    participantId: tenantId
                }
            }    
        },
        include: {
            property: true,
            participants: true,
            messages: true
        }
    });

    return NextResponse.json({ channels });
})