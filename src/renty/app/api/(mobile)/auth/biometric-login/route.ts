import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/db';
import { generateTokens } from '@/lib/mobile-auth';

export async function POST(request: Request) {
  try {
    // Get the phone number from the request
    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Find the tenantAuth with biometric authentication enabled
    const tenantAuth = await prisma.tenantAuth.findFirst({
      where: { 
        phoneNumber,
        biometricEnabled: true,
        isActivated: true
      },
      include: {
        tenant: {
          include: {
            property: true
          }
        }
      }
    });
    
    if (!tenantAuth) {
      return NextResponse.json(
        { error: 'Tenant not found or biometric login not enabled' },
        { status: 404 }
      );
    }
    
    // Generate tokens using the helper function
    const { accessToken, refreshToken } = await generateTokens(tenantAuth.tenantId);
    
    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      tenant: tenantAuth.tenant
    });
  } catch (error) {
    console.error('Error during tenant biometric login:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
