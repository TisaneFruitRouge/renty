import { withAuth } from "@/lib/mobile-auth";
import { prisma } from "@/prisma/db";
import { compare, hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = withAuth(async (req: NextRequest, tenantId: string) => {
    const { currentPasscode, newPasscode } = await req.json();
  
    try {
      const tenantAuth = await prisma.tenantAuth.findUnique({
        where: { tenantId }
      });
  
      if (!tenantAuth) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
  
      const isValidPasscode = await compare(currentPasscode, tenantAuth.passcode);
      if (!isValidPasscode) {
        return NextResponse.json({ error: 'Invalid current passcode' }, { status: 401 });
      }
  
      const hashedNewPasscode = await hash(newPasscode, 10);
      await prisma.tenantAuth.update({
        where: { tenantId },
        data: {
          passcode: hashedNewPasscode,
          isActivated: true,
          tempCode: null,
          tempCodeExpiresAt: null
        }
      });
  
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});
  
  