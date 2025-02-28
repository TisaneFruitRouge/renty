import { withAuth } from "@/lib/mobile-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { z } from "zod";

// Schema validation for the request body
const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
});

export const PUT = withAuth(async (req: NextRequest, tenantId: string) => {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);
    
    // Check if email is being changed and if it's already in use by another tenant
    if (validatedData.email) {
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          email: validatedData.email,
          id: { not: tenantId }
        }
      });
      
      if (existingTenant) {
        return NextResponse.json(
          { error: "Email already in use by another tenant" },
          { status: 400 }
        );
      }
    }
    
    // Update the tenant profile
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        // // Reset email verification if email changed
        // emailVerified: validatedData.email ? false : undefined,
        // // Reset phone verification if phone changed
        // phoneVerified: validatedData.phoneNumber ? false : undefined
      },
      include: {
        property: true
      }
    });
    
    // Also update the phone number in the tenantAuth record if it exists
    if (validatedData.phoneNumber) {
      await prisma.tenantAuth.update({
        where: { tenantId },
        data: { phoneNumber: validatedData.phoneNumber }
      }).catch(error => {
        console.error("Error updating tenantAuth phone number:", error);
        // Continue execution even if this update fails
      });
    }
    
    return NextResponse.json({ tenant: updatedTenant });
  } catch (error) {
    console.error("Error updating tenant profile:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
});