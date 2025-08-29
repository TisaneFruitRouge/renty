import { prisma } from "@/prisma/db";
import type { Prisma } from "@prisma/client";
import { createPropertyChannel } from "../messages/db";
import { enforceResourceLimit } from "../subscription/limits";

export async function getPropertiesForUser(userId: string) {
    const properties = await prisma.property.findMany({
        where: {
            userId
        },
        include: {
            leases: {
                include: {
                  tenants: true
                }
            }
        }
    });

    return properties;
}

export async function getAllPropertiesWithActiveLeases() {
    return await prisma.property.findMany({
        where: {
            leases: {
                some: {
                    status: 'ACTIVE',
                    tenants: {
                        some: {}
                    }
                }
            }
        },
        include: {
            leases: {
                where: {
                    status: 'ACTIVE'
                },
                include: {
                    tenants: true
                }
            },
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
    // Note: This function is deprecated as rental details are now managed at the lease level
    // For backward compatibility, we'll update the active lease for this property
    const activeLease = await prisma.lease.findFirst({
        where: {
            propertyId: id,
            status: 'ACTIVE'
        }
    });

    if (!activeLease) {
        throw new Error('No active lease found for this property');
    }

    const rentDetails = data.rentDetails ?? { baseRent: 0, charges: 0 };

    await prisma.lease.update({
        where: { id: activeLease.id },
        data: {
            rentAmount: rentDetails.baseRent,
            charges: rentDetails.charges,
            currency: data.currency,
            paymentFrequency: data.paymentFrequency,
            depositAmount: data.depositAmount,
            startDate: new Date(data.rentedSince),
            isFurnished: data.isFurnished,
        },
    });

    // Return the property for backward compatibility
    return await getPropertyById(id);
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

    // Get current property count
    const currentProperties = await getPropertiesForUser(userId);

    // throws error if the user has exceeded his limits for the current resource
    await enforceResourceLimit('properties', currentProperties.length);

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

    await createPropertyChannel(property.id, userId);

    return property;
}

export async function calculateMonthlyRevenue(userId: string): Promise<number> {
    const leases = await prisma.lease.findMany({
        where: {
            property: {
                userId
            },
            status: 'ACTIVE'
        },
        select: {
            rentAmount: true,
            charges: true,
            paymentFrequency: true
        }
    });

    return leases.reduce((total, lease) => {
        if (!lease.rentAmount || !lease.paymentFrequency) return total;

        const baseRent = lease.rentAmount;
        const charges = lease.charges || 0;
        const monthlyMultiplier = {
            'biweekly': 2.17, // (52 weeks / 2) / 12 months
            'monthly': 1,
            'quarterly': 1/3,
            'yearly': 1/12
        }[lease.paymentFrequency] || 0;

        return total + ((baseRent + charges) * monthlyMultiplier);
    }, 0);
}

export async function getPropertyCount(userId: string): Promise<number> {
    return await prisma.property.count({
        where: { userId }
    });
}
