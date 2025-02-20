
import { prisma } from '@/prisma/db';
import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const TEMP_CODE_EXPIRY = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  const { phoneNumber } = await req.json();

  try {
    const tenant = await prisma.tenantAuth.findUnique({
      where: { phoneNumber }
    });

    if (!tenant) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const tempCode = Math.random().toString().slice(2, 8);
    const hashedTempCode = await hash(tempCode, 10);

    await prisma.tenantAuth.update({
      where: { phoneNumber },
      data: {
        tempCode: hashedTempCode,
        tempCodeExpiresAt: new Date(Date.now() + TEMP_CODE_EXPIRY)
      }
    });

    // In production, send this via SMS
    return NextResponse.json({ success: true, tempCode });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}