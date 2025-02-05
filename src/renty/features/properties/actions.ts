'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import createProperty, { getPropertiesForUser, updateProperty, getPropertyForUser, updatePropertyRentReceiptSettings } from "./db"
import { createPropertySchema, updatePropertySchema } from "./schemas"
import { headers } from "next/headers"
import { deleteImageFromBlob, uploadImageToBlob } from "./blob"

export type CreatePropertyInput = z.infer<typeof createPropertySchema>

export async function createPropertyAction(values: CreatePropertyInput) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    });

    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }

    const validatedFields = createPropertySchema.safeParse(values)
    if (!validatedFields.success) {
        throw new Error("Invalid fields")
    }

    const { title, address, city, state, country, postalCode } = validatedFields.data

    try {
        const property = await createProperty(
            session.user.id,
            title,
            address,
            city,
            state,
            country,
            postalCode
        )

        revalidatePath("/")
        return { success: true, data: property }
    } catch (error) {
        console.error("Error creating property:", error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to create property" 
        }
    }
}

export async function updatePropertyAction(input: z.infer<typeof updatePropertySchema> & { id: string }) {

    const result = updatePropertySchema.safeParse(input);
    if (!result.success) {
        throw new Error(result.error.message);
    }

    const property = await updateProperty(input.id, {
        ...input
    });

    revalidatePath(`/properties/${property.id}`);
    return {
        data: property,
    };
}

export async function getAllProperties() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    });
    
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    return getPropertiesForUser(session.user.id);
}

export async function updateRentReceiptSettingsAction(propertyId: string, rentReceiptStartDate: Date) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    await getPropertyForUser(propertyId, session.user.id);
    const updatedProperty = await updatePropertyRentReceiptSettings(propertyId, rentReceiptStartDate);

    return { data: updatedProperty };
}

export async function deleteRentReceiptSettingsAction(propertyId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    await getPropertyForUser(propertyId, session.user.id);
    const updatedProperty = await updatePropertyRentReceiptSettings(propertyId, null);

    return { data: updatedProperty };
}

export async function uploadPropertyImagesAction(propertyId: string, files: File[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }

    const property = await getPropertyForUser(propertyId, session.user.id);
    if (!property) {
        throw new Error("Property not found")
    }

    try {
        // Upload all images to blob storage
        const uploadPromises = files.map(file => uploadImageToBlob(file));
        const urls = await Promise.all(uploadPromises);

        // Update property with new image URLs
        const updatedProperty = await updateProperty(propertyId, {
            images: [...(property.images || []), ...urls]
        });

        revalidatePath(`/properties/${propertyId}`);
        return { success: true, data: updatedProperty };
    } catch (error) {
        console.error("Error uploading property images:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to upload images" 
        };
    }
}

export async function removePropertyImageAction(propertyId: string, imageUrl: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }

    const property = await getPropertyForUser(propertyId, session.user.id);
    if (!property) {
        throw new Error("Property not found")
    }

    try {
        // Update property images array first
        const updatedProperty = await updateProperty(propertyId, {
            images: property.images.filter(url => url !== imageUrl)
        });

        // If database update is successful, delete from blob storage
        await deleteImageFromBlob(imageUrl);

        revalidatePath(`/properties/${propertyId}`);
        return { success: true, data: updatedProperty };
    } catch (error) {
        console.error("Error removing property image:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to remove image" 
        };
    }
}

export async function setPrimaryPropertyImageAction(propertyId: string, imageUrl: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }

    const property = await getPropertyForUser(propertyId, session.user.id);
    if (!property) {
        throw new Error("Property not found")
    }

    try {
        // Remove the image from its current position and add it to the front
        const otherImages = property.images.filter(url => url !== imageUrl);
        const updatedProperty = await updateProperty(propertyId, {
            images: [imageUrl, ...otherImages]
        });

        revalidatePath(`/properties/${propertyId}`);
        return { success: true, data: updatedProperty };
    } catch (error) {
        console.error("Error setting primary property image:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to set primary image" 
        };
    }
}
