import { prisma } from "@/prisma/db";
import type { Prisma } from "@prisma/client";

export async function getPropertiesForUser(userId: string) {
    const properties = await prisma.property.findMany({
        where: {
            userId
        }, 
        include: {
            tenants: true
        }
    });

    return properties;
}

export async function getAllPropertiesWithActiveTenants() {
    return await prisma.property.findMany({
        where: {
            tenants: {
                some: {}
            }
        },
        include: {
            tenants: true,
            user: true
        }
    });
}

export async function getPropertyById(id: string) {
    const property = await prisma.property.findUnique({
        where: {
            id
        }
    });

    if (!property) {
        throw new Error("Property not found");
    }

    return property;
}

export async function getPropertyForUser(id: string, userId: string) {
    const property = await prisma.property.findUnique({
        where: {
            id,
            userId,
        },
    });

    if (!property) {
        throw new Error("Property not found");
    }

    return property;
}

export async function updateProperty(id: string, data: Omit<Prisma.propertyUpdateInput, "id" | "createdAt" | "updatedAt">) {
    return await prisma.property.update({
        where: { id },
        data: {
            title: data.title,
            images: data.images,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            postalCode: data.postalCode,
            rentDetails: data.rentDetails,
            currency: data.currency,
            paymentFrequency: data.paymentFrequency,
            depositAmount: data.depositAmount,
            rentedSince: data.rentedSince,
            isFurnished: data.isFurnished,
        },
    });
}

export async function updatePropertyRental(id: string, data: {
    rentDetails: { baseRent: number; charges: number };
    currency: string;
    paymentFrequency: string;
    depositAmount: number;
    rentedSince: string;
    isFurnished: boolean;
}) {
    const rentDetails = data.rentDetails ?? { baseRent: 0, charges: 0 };
    
    const property = await prisma.property.update({
        where: { id },
        data: {
            rentDetails: rentDetails as Prisma.JsonObject,
            currency: data.currency,
            paymentFrequency: data.paymentFrequency,
            depositAmount: data.depositAmount,
            rentedSince: new Date(data.rentedSince),
            isFurnished: data.isFurnished,
        },
    });
    return property;
}

export async function updatePropertyRentReceiptSettings(id: string, rentReceiptStartDate: Date | null) {
    return await prisma.property.update({
        where: { id },
        data: {
            rentReceiptStartDate,
        },
    });
}

export default async function createProperty(
    userId: string, 
    title: string, 
    address: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
) {
    const property = await prisma.property.create({
        data: {
            id: crypto.randomUUID(),
            userId,
            title,
            address,
            city,
            state,
            country,
            postalCode,
            images: [],
        },
    });

    return property;
}

export async function calculateMonthlyRevenue(userId: string): Promise<number> {
    const properties = await prisma.property.findMany({
        where: {
            userId,
        },
        select: {
            rentDetails: true,
            paymentFrequency: true
        }
    });

    return properties.reduce((total, property) => {
        const rentDetails = property.rentDetails as { baseRent: number; charges: number } | null;
        if (!rentDetails || !property.paymentFrequency) return total;

        const { baseRent, charges } = rentDetails;
        const monthlyMultiplier = {
            'biweekly': 2.17, // (52 weeks / 2) / 12 months
            'monthly': 1,
            'quarterly': 1/3,
            'yearly': 1/12
        }[property.paymentFrequency] || 0;

        return total + ((baseRent + charges) * monthlyMultiplier);
    }, 0);
}

