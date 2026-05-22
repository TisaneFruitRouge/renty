import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { reviveDates } from "@/lib/convex-map";
import type { RentReceiptStatus, rentReceipt, property, tenant, lease, user } from "@prisma/client";

type ReceiptWithRelations = rentReceipt & {
  property: property & { user: user };
  tenant: tenant;
  lease: (lease & { tenants: tenant[] }) | null;
};
type ReceiptWithPropertyTenant = rentReceipt & {
  property: property;
  tenant: tenant;
};

export async function deleteReceipt(id: string) {
  const removed = await getConvexClient().mutation(api.rentReceipts.remove, { id });
  return reviveDates(removed) as unknown as rentReceipt;
}

export default async function createReceipt(
  startDate: Date,
  endDate: Date,
  baseRent: number,
  charges: number,
  paymentFrequency: string, // "biweekly" | "monthly" | "quarterly" | "yearly"
  propertyId: string,
  tenantId: string,
  leaseId?: string,
) {
  const created = await getConvexClient().mutation(api.rentReceipts.create, {
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
    baseRent,
    charges,
    paymentFrequency,
    propertyId,
    tenantId,
    leaseId: leaseId ?? null,
  });
  return reviveDates(created) as unknown as rentReceipt;
}

export async function createSharedReceipt(
  startDate: Date,
  endDate: Date,
  baseRent: number,
  charges: number,
  paymentFrequency: string,
  propertyId: string,
  tenants: string[], // Array of tenant IDs
  leaseId?: string,
) {
  const created = await getConvexClient().mutation(api.rentReceipts.createShared, {
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
    baseRent,
    charges,
    paymentFrequency,
    propertyId,
    tenantIds: tenants,
    leaseId: leaseId ?? null,
  });
  return reviveDates(created) as unknown as rentReceipt;
}

export async function addBlobUrlToReceipt(receiptId: string, blobUrl: string) {
  const updated = await getConvexClient().mutation(api.rentReceipts.addBlobUrl, {
    id: receiptId,
    blobUrl,
  });
  return reviveDates(updated) as unknown as rentReceipt;
}

export async function getReceiptById(receiptId: string) {
  const receipt = await getConvexClient().query(api.rentReceipts.getById, { id: receiptId });
  return reviveDates(receipt) as unknown as ReceiptWithRelations | null;
}

export async function getReceiptsOfUser(userId: string, limit?: number) {
  const receipts = await getConvexClient().query(api.rentReceipts.listForUser, { userId, limit });
  return reviveDates(receipts) as unknown as ReceiptWithPropertyTenant[];
}

export async function updateReceiptStatus(receiptId: string, status: RentReceiptStatus) {
  const updated = await getConvexClient().mutation(api.rentReceipts.updateStatus, {
    id: receiptId,
    status,
  });
  return reviveDates(updated) as unknown as rentReceipt;
}

export async function countWaitingReceiptsForUser(userId: string): Promise<number> {
  return await getConvexClient().query(api.rentReceipts.countWaitingForUser, { userId });
}

export async function getRentReceiptsOfProperty(propertyId: string, limit?: number) {
  const receipts = await getConvexClient().query(api.rentReceipts.listByProperty, {
    propertyId,
    limit,
  });
  return reviveDates(receipts) as unknown as ReceiptWithPropertyTenant[];
}

/**
 * Returns all PENDING receipts created on or before `cutoffDate`.
 * The cutoff implements the landlord review window: receipts younger than
 * the cutoff are held back so the landlord can review before sending.
 */
export async function getPendingReceiptsOlderThan(cutoffDate: Date) {
  const receipts = await getConvexClient().query(api.rentReceipts.pendingOlderThan, {
    cutoff: cutoffDate.getTime(),
  });
  return reviveDates(receipts) as unknown as ReceiptWithRelations[];
}
