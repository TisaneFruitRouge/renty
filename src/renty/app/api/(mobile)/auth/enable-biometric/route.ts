import { NextResponse } from 'next/server';
import { db } from "@/lib/convex-compat";

export async function POST(request: Request) {
  try {
    // Get tenant ID from request
    const { tenantId } = await request.json();
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }
    
    // Find the tenantAuth record
    const tenantAuth = await db.tenantAuth.findUnique({
      where: { tenantId }
    });
    
    if (!tenantAuth) {
      return NextResponse.json(
        { error: 'Tenant authentication record not found' },
        { status: 404 }
      );
    }
    
    // Update tenantAuth record to enable biometric authentication
    await db.tenantAuth.update({
      where: { id: tenantAuth.id },
      data: { 
        biometricEnabled: true,
        // You might want to store a public key here if you're using asymmetric crypto
        // biometricPublicKey: publicKey
      }
    });
    
    return NextResponse.json(
      { success: true, message: 'Biometric authentication enabled for tenant' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error enabling biometric authentication for tenant:', error);
    return NextResponse.json(
      { error: 'Failed to enable biometric authentication' },
      { status: 500 }
    );
  }
}
