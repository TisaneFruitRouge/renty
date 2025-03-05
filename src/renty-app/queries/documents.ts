import { api } from "@/lib/api";
import { Document, Property } from "@/lib/types";

export type DocumentWithProperty = Document & {
    property: Property
};

/**
 * Get all documents shared with a tenant for a specific property
 */
export async function getPropertyDocuments(propertyId: string, category?: string) {
    const url = `/api/documents?propertyId=${propertyId}${category ? `&category=${category}` : ''}`;
    const response = await api.get(url);
    return response.data as { documents: DocumentWithProperty[] };
}

/**
 * Get a specific document by ID
 */
export async function getDocument(documentId: string) {
    const response = await api.get(`/api/documents/${documentId}`);
    return response.data as { document: DocumentWithProperty };
}
