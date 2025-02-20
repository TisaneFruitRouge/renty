import { generateTokens } from "@/lib/mobile-auth";
import { prisma } from "@/prisma/db";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { phoneNumber, passcode } = await req.json();
    
    try {
      const tenantAuth = await prisma.tenantAuth.findUnique({
        where: { phoneNumber },
        include: { tenant: true }
      });

      if (!tenantAuth) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
  
      // Check if it's first-time login with temporary code
      if (!tenantAuth.isActivated && tenantAuth.tempCode) {
        const isValidTempCode = await compare(passcode, tenantAuth.tempCode);
        if (!isValidTempCode || tenantAuth.tempCodeExpiresAt! < new Date()) {
          return NextResponse.json(
            { error: 'Invalid or expired temporary code' },
            { status: 401 }
          );
        }
      } else {
        // Regular login with passcode
        const isValidPasscode = await compare(passcode, tenantAuth.passcode);
        if (!isValidPasscode) {
          return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
        }
      }
  
      const { accessToken, refreshToken } = await generateTokens(tenantAuth.tenantId);
  
      return NextResponse.json({
        accessToken,
        refreshToken,
        tenant: {
          id: tenantAuth.tenant.id,
          firstName: tenantAuth.tenant.firstName,
          lastName: tenantAuth.tenant.lastName
        }
      });
    } catch (err) {
      console.log(err)
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}