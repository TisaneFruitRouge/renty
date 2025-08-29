'use server'

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DocumentCategory } from "@prisma/client";
import { getPropertyForUser } from "../properties/db";
import { createDocument, deleteDocument, updateDocument } from "./db";
import { deleteDocumentFromBlob, uploadDocumentToBlob } from "./blob";
import { addUserIdToAction } from "@/lib/helpers";

// Schema for document upload validation
const uploadDocumentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.nativeEnum(DocumentCategory),
    sharedWithTenant: z.boolean().default(false)
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const uploadDocumentAction = addUserIdToAction(async (
    userId: string,
    propertyId: string, 
    file: File, 
    data: UploadDocumentInput
) => {
    // Verify property belongs to user
    const property = await getPropertyForUser(propertyId, userId);
    if (!property) {
        throw new Error("Property not found");
    }

    // Validate input data
    const validatedFields = uploadDocumentSchema.safeParse(data);
    if (!validatedFields.success) {
        throw new Error("Invalid fields");
    }

    try {
        // Upload document to blob storage
        const { url, size } = await uploadDocumentToBlob(file);
        
        // Get file extension
        const fileType = file.name.split('.').pop()?.toLowerCase() || '';
        
        // Create document record in database
        const document = await createDocument(
            propertyId,
            data.name,
            url,
            fileType,
            size,
            data.category,
            data.sharedWithTenant,
            data.description
        );

        revalidatePath(`/properties/${propertyId}/vault`);
        return { success: true, data: document };
    } catch (error) {
        console.error("Error uploading document:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to upload document" 
        };
    }
});

export const deleteDocumentAction = addUserIdToAction(async (
    userId: string,
    documentId: string, 
    propertyId: string
) => {
    // Verify property belongs to user
    const property = await getPropertyForUser(propertyId, userId);
    if (!property) {
        throw new Error("Property not found");
    }

    try {
        // Get document to retrieve URL before deletion
        const document = await deleteDocument(documentId);
        
        // Delete from blob storage
        await deleteDocumentFromBlob(document.fileUrl);

        revalidatePath(`/properties/${propertyId}/vault`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting document:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to delete document" 
        };
    }
});

export const updateDocumentAction = addUserIdToAction(async (
    userId: string,
    documentId: string, 
    propertyId: string, 
    data: {
        name?: string;
        description?: string;
        category?: DocumentCategory;
        sharedWithTenant?: boolean;
    }
) => {
    // Verify property belongs to user
    const property = await getPropertyForUser(propertyId, userId);
    if (!property) {
        throw new Error("Property not found");
    }

    try {
        const document = await updateDocument(documentId, data);

        revalidatePath(`/properties/${propertyId}/vault`);
        return { success: true, data: document };
    } catch (error) {
        console.error("Error updating document:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to update document" 
        };
    }
});
