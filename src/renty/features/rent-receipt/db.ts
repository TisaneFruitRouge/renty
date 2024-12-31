import { prisma } from "@/prisma/db";

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