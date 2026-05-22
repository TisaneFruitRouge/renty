import { withAuth } from "@/lib/mobile-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/convex-prisma";

export const GET = withAuth(async (req: NextRequest, tenantId: string) => {
    const channels = await db.channel.findMany({
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