import "server-only";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";

type StorageBucket = "propertyImage" | "rentReceipt" | "document" | "other";

type UploadInput = {
  data: Blob;
  bucket: StorageBucket;
  name?: string;
  contentType?: string;
  size?: number;
};

export async function uploadToConvexStorage(input: UploadInput) {
  const convex = getConvexClient();
  const uploadUrl = await convex.mutation(api.files.generateUploadUrl);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: input.contentType ? { "Content-Type": input.contentType } : {},
    body: input.data,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Convex storage upload failed: ${uploadResponse.statusText}`);
  }

  const { storageId } = (await uploadResponse.json()) as { storageId: string };

  return await convex.mutation(api.files.saveUploadedFile, {
    storageId: storageId as Id<"_storage">,
    bucket: input.bucket,
    name: input.name,
    contentType: input.contentType,
    size: input.size,
  });
}

export async function deleteConvexFileByUrl(url: string) {
  const convex = getConvexClient();
  return await convex.mutation(api.files.deleteByUrl, { url });
}
