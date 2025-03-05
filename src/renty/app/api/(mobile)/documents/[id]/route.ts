import { withAuth } from "@/lib/mobile-auth";
import { prisma } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/documents/[id]
 * 
 * Returns a specific document by ID if it's shared with the tenant
 */
export const GET = withAuth(async (req: NextRequest, tenantId: string) => {
  // Extract the document ID from the URL
  const id = req.url.split('/').pop();
  try {
    const documentId = id;

    // Get the document
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      include: {
        property: true,
      },
    });

    // Check if document exists
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if document is shared with tenants
    if (!document.sharedWithTenant) {
      return NextResponse.json(
        { error: 'Document not shared with tenants' },
        { status: 403 }
      );
    }

    // Verify that the tenant is associated with the property
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        propertyId: document.propertyId,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not associated with this property' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      document: {
        id: document.id,
        name: document.name,
        description: document.description,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        fileSize: document.fileSize,
        category: document.category,
        uploadedAt: document.uploadedAt,
        updatedAt: document.updatedAt,
        property: document.property,
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
});
