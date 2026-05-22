import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { reviveDates } from "@/lib/convex-map";
import type { DocumentCategory, document } from "@/lib/types";

export async function getDocumentsForProperty(propertyId: string) {
  const documents = await getConvexClient().query(api.documents.listForProperty, { propertyId });
  return reviveDates(documents) as unknown as document[];
}

export async function getDocumentById(id: string) {
  const document = await getConvexClient().query(api.documents.getById, { id });
  return reviveDates(document) as unknown as document | null;
}

export async function createDocument(
  propertyId: string,
  name: string,
  fileUrl: string,
  fileType: string,
  fileSize: number,
  category: DocumentCategory,
  sharedWithTenant: boolean = false,
  description?: string,
) {
  const created = await getConvexClient().mutation(api.documents.create, {
    propertyId,
    name,
    fileUrl,
    fileType,
    fileSize,
    category,
    sharedWithTenant,
    description: description ?? null,
  });
  return reviveDates(created) as unknown as document;
}

export async function deleteDocument(id: string) {
  const removed = await getConvexClient().mutation(api.documents.remove, { id });
  return reviveDates(removed) as unknown as document;
}

export async function updateDocument(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: DocumentCategory;
    sharedWithTenant?: boolean;
  },
) {
  const updated = await getConvexClient().mutation(api.documents.update, {
    id,
    name: data.name,
    description: data.description,
    category: data.category,
    sharedWithTenant: data.sharedWithTenant,
  });
  return reviveDates(updated) as unknown as document;
}
