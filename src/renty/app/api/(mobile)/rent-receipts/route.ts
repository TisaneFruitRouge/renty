import { withAuth } from "@/lib/mobile-auth";
import { prisma } from "@/prisma/db";
import { Prisma, RentReceiptStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (req: NextRequest, tenantId) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get query parameters
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status') as RentReceiptStatus | null;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null;
    const sortOrder = searchParams.get('sortOrder')?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 3;

    // Build where clause
    const where: Prisma.rentReceiptWhereInput = {
      tenantId,
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt = {
          ...where.createdAt,
          gte: startDate,
        };
      }
      if (endDate) {
        where.createdAt = {
          ...where.createdAt,
          lte: endDate,
        };
      }
    }

    // Get rent receipts with filters and sorting
    const rentReceipts = await prisma.rentReceipt.findMany({
      where,
      orderBy: {
        updatedAt: sortOrder,
      },
      include: {
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
      },
      take: limit,
    });

    return NextResponse.json({ rentReceipts });
  } catch (error) {
    console.error('Error fetching rent receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rent receipts' },
      { status: 500 }
    );
  }
});
