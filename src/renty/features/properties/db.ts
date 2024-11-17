import { prisma } from "@/prisma/db";

export async function getPropertiesForUser(userId: string) {
    const properties = await prisma.property.findMany({
        where: {
            userId
        }
    });

    return properties;
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