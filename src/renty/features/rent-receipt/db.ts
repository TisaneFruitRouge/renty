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
    tenantId: string
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
                tenantId
            }
        });
    });
}

export async function addBlobUrlToRceipt(receiptId: string, blobUrl: string) {
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
            tenant: true
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

export async function getPendingReceiptsForDate(date: Date) {
    // Create a date range for the entire day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.rentReceipt.findMany({
        where: {
            status: RentReceiptStatus.PENDING,
            startDate: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: {
            property: {
                include: {
                    user: true
                }
            },
            tenant: true
        }
    });
}