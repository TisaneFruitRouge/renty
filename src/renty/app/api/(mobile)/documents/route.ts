import { withAuth } from "@/lib/mobile-auth";
import { prisma } from "@/prisma/db";
import type { DocumentCategory } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/documents
 * 
 * Returns all documents shared with a tenant for a specific property
 * 
 * Query parameters:
 * - propertyId: Filter documents by property ID (required)
 * - category: Filter documents by category (optional)
 */
export const GET = withAuth(async (req: NextRequest, tenantId: string) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get query parameters
    const propertyId = searchParams.get('propertyId');
    const category = searchParams.get('category');
    
    // Validate required parameters
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Verify that the tenant is associated with the property
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        propertyId,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not associated with this property' },
        { status: 403 }
      );
    }

    // Build where clause
    const where = {
      propertyId,
      sharedWithTenant: true,
      ...(category && { category: category as DocumentCategory }),
    };

    // Get documents with filters
    const documents = await prisma.document.findMany({
      where,
      orderBy: {
        uploadedAt: 'desc'
      },
      include: {
        property: true
      }
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared documents' },
      { status: 500 }
    );
  }
});
