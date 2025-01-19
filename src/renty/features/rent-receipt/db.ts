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

export async function getReceiptsOfUser(userId: string) {
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
        }
    });
}

export async function updateReceiptStatus(receiptId: string, status: RentReceiptStatus) {
    return await prisma.rentReceipt.update({
        where: { id: receiptId },
        data: { status }
    });
}
