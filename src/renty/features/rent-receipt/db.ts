import { prisma } from "@/prisma/db";
import { RentReceiptStatus } from "@prisma/client";

export async function deleteReceipt(id: string) {
    return await prisma.rentReceipt.delete({
        where: { id }
    });
}

export default async function createReceipt(
    startDate: Date,
    endDate: Date,
    baseRent: number,
    charges: number,
    paymentFrequency: string, // "biweekly" | "monthly" | "quarterly" | "yearly"
    propertyId: string,
    tenantId: string,
    leaseId?: string
) {
    return await prisma.$transaction(async (tx) => {
        return await tx.rentReceipt.create({
            data: {
                startDate,
                endDate,
                baseRent,
                charges,
                paymentFrequency,
                propertyId,
                tenantId,
                leaseId
            }
        });
    });
}

// Create receipt for shared lease (multiple tenants, one receipt)
export async function createSharedReceipt(
    startDate: Date,
    endDate: Date,
    baseRent: number,
    charges: number,
    paymentFrequency: string,
    propertyId: string,
    tenants: string[], // Array of tenant IDs
    leaseId?: string
) {
    if (tenants.length === 0) {
        throw new Error('At least one tenant is required for shared receipt');
    }

    return await prisma.$transaction(async (tx) => {
        // Create receipt with first tenant as primary tenant
        // In a shared lease, all tenants are on the same receipt
        return await tx.rentReceipt.create({
            data: {
                startDate,
                endDate,
                baseRent,
                charges,
                paymentFrequency,
                propertyId,
                tenantId: tenants[0], // Store first tenant as primary
                leaseId
            }
        });
    });
}

export async function addBlobUrlToReceipt(receiptId: string, blobUrl: string) {
    return await prisma.rentReceipt.update({
        where: { id: receiptId },
        data: { blobUrl }
    });
}

export async function getReceiptById(receiptId: string) {
    return await prisma.rentReceipt.findUnique({
        where: { id: receiptId },
        include: {
            property: {
                include: {
                    user: true
                }
            },
            tenant: true,
            lease: {
                include: {
                    tenants: true
                }
            }
        }
    });
}

export async function getReceiptsOfUser(userId: string, limit?: number) {
    return await prisma.rentReceipt.findMany({
        where: {
            property: {
                userId
            }
        },
        include: {
            property: true,
            tenant: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit
    });
}

export async function updateReceiptStatus(receiptId: string, status: RentReceiptStatus) {
    return await prisma.rentReceipt.update({
        where: { id: receiptId },
        data: { status }
    });
}

export async function countWaitingReceiptsForUser(userId: string): Promise<number> {
    return await prisma.rentReceipt.count({
        where: {
            property: {
                userId
            },
            status: {
                in: [RentReceiptStatus.PENDING, RentReceiptStatus.LATE]
            }
        }
    });
}

export async function getRentReceiptsOfProperty(propertyId: string, limit?: number) {
    return await prisma.rentReceipt.findMany({
        where: {
            propertyId
        },
        include: {
            property: true,
            tenant: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit
    });
}

/**
 * Returns all PENDING receipts created more than `cutoffDate` ago.
 * The cutoff implements the landlord review window: receipts younger than
 * the cutoff are held back so the landlord can review before sending.
 */
export async function getPendingReceiptsOlderThan(cutoffDate: Date) {
    return await prisma.rentReceipt.findMany({
        where: {
            status: RentReceiptStatus.PENDING,
            createdAt: {
                lte: cutoffDate
            }
        },
        include: {
            property: {
                include: {
                    user: true
                }
            },
            tenant: true,
            lease: {
                include: {
                    tenants: true
                }
            }
        }
    });
}
