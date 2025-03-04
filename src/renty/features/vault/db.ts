import { prisma } from "@/prisma/db";
import { DocumentCategory } from "@prisma/client";

export async function getDocumentsForProperty(propertyId: string) {
    return prisma.document.findMany({
        where: {
            propertyId
        },
        orderBy: {
            uploadedAt: 'desc'
        }
    });
}

export async function getDocumentById(id: string) {
    return prisma.document.findUnique({
        where: {
            id
        }
    });
}

export async function createDocument(
    propertyId: string,
    name: string,
    fileUrl: string,
    fileType: string,
    fileSize: number,
    category: DocumentCategory,
    description?: string
) {
    return prisma.document.create({
        data: {
            propertyId,
            name,
            description,
            fileUrl,
            fileType,
            fileSize,
            category
        }
    });
}

export async function deleteDocument(id: string) {
    return prisma.document.delete({
        where: {
            id
        }
    });
}

export async function updateDocument(
    id: string,
    data: {
        name?: string;
        description?: string;
        category?: DocumentCategory;
    }
) {
    return prisma.document.update({
        where: {
            id
        },
        data
    });
}
