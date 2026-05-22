import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { reviveDates } from "@/lib/convex-map";
import type {
  LeaseType,
  LeaseStatus,
  TerminationReason,
  lease,
  property,
  tenant,
  tenantAuth,
  user,
  document,
} from "@/lib/types";

type TenantWithAuth = tenant & { auth: tenantAuth | null };
type PropertyWithUser = property & { user: user };
type LeasePlain = lease & { property: property | null; tenants: tenant[] };
type LeaseWithAuth = lease & { property: property; tenants: TenantWithAuth[] };
type LeaseWithAuthAndDocuments = lease & {
  property: property & { documents: document[] };
  tenants: TenantWithAuth[];
};
type LeaseWithUser = lease & { property: PropertyWithUser | null; tenants: TenantWithAuth[] };

export interface CreateLeaseData {
  propertyId: string;
  startDate: Date;
  endDate?: Date;
  rentAmount: number;
  depositAmount?: number;
  charges?: number;
  leaseType: LeaseType;
  isFurnished?: boolean;
  paymentFrequency?: string;
  currency?: string;
  status?: LeaseStatus;
  notes?: string;
  autoGenerateReceipts?: boolean;
  receiptGenerationDate?: number;
  nextReceiptDate?: Date;
  renewedFromLeaseId?: string;
}

export interface UpdateLeaseData {
  startDate?: Date;
  endDate?: Date;
  rentAmount?: number;
  depositAmount?: number;
  charges?: number;
  leaseType?: LeaseType;
  isFurnished?: boolean;
  paymentFrequency?: string;
  currency?: string;
  status?: LeaseStatus;
  notes?: string;
  autoGenerateReceipts?: boolean;
  receiptGenerationDate?: number;
  nextReceiptDate?: Date;
}

const ms = (date?: Date | null) => (date ? date.getTime() : undefined);

function leaseInput(data: CreateLeaseData) {
  return {
    propertyId: data.propertyId,
    startDate: data.startDate.getTime(),
    endDate: ms(data.endDate),
    rentAmount: data.rentAmount,
    depositAmount: data.depositAmount,
    charges: data.charges,
    leaseType: data.leaseType,
    isFurnished: data.isFurnished,
    paymentFrequency: data.paymentFrequency,
    currency: data.currency,
    status: data.status,
    notes: data.notes,
    autoGenerateReceipts: data.autoGenerateReceipts,
    receiptGenerationDate: data.receiptGenerationDate,
    nextReceiptDate: ms(data.nextReceiptDate),
    renewedFromLeaseId: data.renewedFromLeaseId,
  };
}

export async function createLeaseInDb(data: CreateLeaseData) {
  const created = await getConvexClient().mutation(api.leases.create, leaseInput(data));
  return reviveDates(created) as unknown as LeasePlain;
}

export async function terminateLeaseInDb(
  leaseId: string,
  terminationDate: Date,
  terminationReason: TerminationReason,
  notes?: string,
) {
  const updated = await getConvexClient().mutation(api.leases.terminate, {
    id: leaseId,
    endDate: terminationDate.getTime(),
    terminationReason,
    notes,
  });
  return reviveDates(updated) as unknown as LeasePlain;
}

export async function renewLeaseInDb(oldLeaseId: string, newLeaseData: CreateLeaseData) {
  const result = await getConvexClient().mutation(api.leases.renew, {
    oldLeaseId,
    newLease: leaseInput(newLeaseData),
  });
  return reviveDates(result) as unknown as { newLease: LeasePlain };
}

export async function getLeaseById(leaseId: string) {
  const lease = await getConvexClient().query(api.leases.getById, { id: leaseId });
  return reviveDates(lease) as unknown as LeaseWithAuth | null;
}

export async function getLeasesByPropertyId(propertyId: string) {
  const leases = await getConvexClient().query(api.leases.listByProperty, { propertyId });
  return reviveDates(leases) as unknown as (lease & { tenants: TenantWithAuth[] })[];
}

export async function getActiveLeasesByPropertyId(propertyId: string) {
  const leases = await getConvexClient().query(api.leases.listActiveByProperty, { propertyId });
  return reviveDates(leases) as unknown as (lease & { tenants: TenantWithAuth[] })[];
}

export async function getLeasesForUser(userId: string) {
  const leases = await getConvexClient().query(api.leases.listForUser, { userId });
  return reviveDates(leases) as unknown as LeaseWithAuth[];
}

export async function getActiveLeasesForUser(userId: string) {
  const leases = await getConvexClient().query(api.leases.listActiveForUser, { userId });
  return reviveDates(leases) as unknown as LeaseWithAuth[];
}

export async function updateLeaseInDb(leaseId: string, data: UpdateLeaseData) {
  const updated = await getConvexClient().mutation(api.leases.update, {
    id: leaseId,
    startDate: ms(data.startDate),
    endDate: ms(data.endDate),
    rentAmount: data.rentAmount,
    depositAmount: data.depositAmount,
    charges: data.charges,
    leaseType: data.leaseType,
    isFurnished: data.isFurnished,
    paymentFrequency: data.paymentFrequency,
    currency: data.currency,
    status: data.status,
    notes: data.notes,
    autoGenerateReceipts: data.autoGenerateReceipts,
    receiptGenerationDate: data.receiptGenerationDate,
    nextReceiptDate: ms(data.nextReceiptDate),
  });
  return reviveDates(updated) as unknown as LeaseWithAuth;
}

export async function deleteLeaseFromDb(leaseId: string) {
  const removed = await getConvexClient().mutation(api.leases.remove, { id: leaseId });
  return reviveDates(removed) as unknown as lease;
}

export async function addTenantToLeaseInDb(leaseId: string, tenantId: string) {
  const updated = await getConvexClient().mutation(api.tenants.update, { id: tenantId, leaseId });
  return reviveDates(updated) as unknown as tenant;
}

export async function removeTenantFromLeaseInDb(tenantId: string) {
  const updated = await getConvexClient().mutation(api.tenants.update, { id: tenantId, leaseId: null });
  return reviveDates(updated) as unknown as tenant;
}

export async function getLeaseWithTenants(leaseId: string) {
  const lease = await getConvexClient().query(api.leases.getWithTenants, { id: leaseId });
  return reviveDates(lease) as unknown as LeaseWithUser | null;
}

export async function getExpiredLeases() {
  const leases = await getConvexClient().query(api.leases.getExpired, {});
  return reviveDates(leases) as unknown as LeasePlain[];
}

export async function getLeasesByStatus(status: LeaseStatus) {
  const leases = await getConvexClient().query(api.leases.listByStatus, { status });
  return reviveDates(leases) as unknown as LeaseWithAuth[];
}

export async function updateLeaseStatus(leaseId: string, status: LeaseStatus) {
  const updated = await getConvexClient().mutation(api.leases.updateStatus, { id: leaseId, status });
  return reviveDates(updated) as unknown as lease;
}

export async function getTenantsAvailableForLease(userId: string) {
  const tenants = await getConvexClient().query(api.tenants.listAvailableForUser, { userId });
  return reviveDates(tenants) as unknown as tenant[];
}

export async function findLeaseForUser(leaseId: string, userId: string) {
  const lease = await getConvexClient().query(api.leases.findForUser, { id: leaseId, userId });
  return reviveDates(lease) as unknown as LeaseWithAuthAndDocuments | null;
}

export async function getLeaseCountForUser(userId: string): Promise<number> {
  return await getConvexClient().query(api.leases.countForUser, { userId });
}

export async function updateLeaseRentReceiptSettings(
  leaseId: string,
  autoGenerateReceipts: boolean,
  receiptGenerationDate?: number,
  nextReceiptDate?: Date,
) {
  const updated = await getConvexClient().mutation(api.leases.updateRentReceiptSettings, {
    id: leaseId,
    autoGenerateReceipts,
    receiptGenerationDate,
    nextReceiptDate: ms(nextReceiptDate),
  });
  return reviveDates(updated) as unknown as LeasePlain;
}

export async function getLeasesRequiringReceiptGeneration() {
  const leases = await getConvexClient().query(api.leases.requiringReceiptGeneration, {});
  return reviveDates(leases) as unknown as (lease & {
    property: PropertyWithUser;
    tenants: TenantWithAuth[];
  })[];
}

export async function updateNextReceiptDate(leaseId: string, nextDate: Date) {
  const updated = await getConvexClient().mutation(api.leases.updateNextReceiptDate, {
    id: leaseId,
    nextReceiptDate: nextDate.getTime(),
  });
  return reviveDates(updated) as unknown as lease;
}

export async function countExpiringLeasesForUser(userId: string, days = 30): Promise<number> {
  return await getConvexClient().query(api.leases.countExpiringForUser, { userId, days });
}

export async function getLeaseWithReceiptSettings(leaseId: string) {
  const lease = await getConvexClient().query(api.leases.getWithReceiptSettings, { id: leaseId });
  return reviveDates(lease) as unknown as LeaseWithUser | null;
}
