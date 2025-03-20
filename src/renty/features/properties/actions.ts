'use server'

import { revalidatePath } from "next/cache"
import { z } from "zod"
import createProperty, { getPropertiesForUser, updateProperty, getPropertyForUser, updatePropertyRentReceiptSettings, getPropertyCount } from "./db"
import { createPropertySchema, updatePropertySchema } from "./schemas"
import { deleteImageFromBlob, uploadImageToBlob } from "./blob"
import { addUserIdToAction } from "@/lib/helpers"

export type CreatePropertyInput = z.infer<typeof createPropertySchema>

export const createPropertyAction = addUserIdToAction(async (userId: string, values: CreatePropertyInput) => {
    
    const validatedFields = createPropertySchema.safeParse(values)
    if (!validatedFields.success) {
        throw new Error("Invalid fields")
    }

    const { title, address, city, state, country, postalCode } = validatedFields.data

    try {
        const property = await createProperty(
            userId,
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
});

export const updatePropertyAction = addUserIdToAction(async (userId: string, input: z.infer<typeof updatePropertySchema> & { id: string }) => {
    const result = updatePropertySchema.safeParse(input);
    if (!result.success) {
        throw new Error(result.error.message);
    }

    // Verify the property belongs to the user
    await getPropertyForUser(input.id, userId);

    const property = await updateProperty(input.id, {
        ...input
    });

    revalidatePath(`/properties/${property.id}`);
    return {
        data: property,
    };
});

export const getAllProperties = addUserIdToAction(async (userId: string) => {
    return getPropertiesForUser(userId);
});

export const updateRentReceiptSettingsAction = addUserIdToAction(async (userId: string, propertyId: string, rentReceiptStartDate: Date) => {
    await getPropertyForUser(propertyId, userId);
    const updatedProperty = await updatePropertyRentReceiptSettings(propertyId, rentReceiptStartDate);

    return { data: updatedProperty };
});

export const deleteRentReceiptSettingsAction = addUserIdToAction(async (userId: string, propertyId: string) => {
    await getPropertyForUser(propertyId, userId);
    const updatedProperty = await updatePropertyRentReceiptSettings(propertyId, null);

    return { data: updatedProperty };
});

export const uploadPropertyImagesAction = addUserIdToAction(async (userId: string, propertyId: string, files: File[]) => {
    const property = await getPropertyForUser(propertyId, userId);
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
});

export const removePropertyImageAction = addUserIdToAction(async (userId: string, propertyId: string, imageUrl: string) => {
    const property = await getPropertyForUser(propertyId, userId);
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
});

export const setPrimaryPropertyImageAction = addUserIdToAction(async (userId: string, propertyId: string, imageUrl: string) => {
    const property = await getPropertyForUser(propertyId, userId);
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
});

export const getPropertyCountAction = addUserIdToAction(async (userId: string) => {
    try {
        const count = await getPropertyCount(userId);
        
        return { success: true, data: count };
    } catch (error) {
        console.error("Error getting property count:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to get property count" 
        };
    }
});
