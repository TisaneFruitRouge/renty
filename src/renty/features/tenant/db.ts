import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { reviveDates } from "@/lib/convex-map";
import type { tenant, tenantAuth, lease, property } from "@prisma/client";
import type { CreateTenantFormData } from "./components/CreateTenantForm";
import type { EditTenantFormData } from "./components/EditTenantForm";

export async function createTenantInDb(data: CreateTenantFormData & { userId: string }) {
  const created = await getConvexClient().mutation(api.tenants.create, {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    notes: data.notes ?? null,
    leaseId: data.leaseId || null,
    userId: data.userId,
  });
  return reviveDates(created) as unknown as tenant;
}

export async function createTenantAuthInDb(
  tenantId: string,
  phoneNumber: string,
  hashedTempCode: string,
) {
  const created = await getConvexClient().mutation(api.tenants.createAuth, {
    tenantId,
    phoneNumber,
    tempCode: hashedTempCode,
    tempCodeExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  return reviveDates(created) as unknown as tenantAuth;
}

export async function getTenantById(tenantId: string) {
  const tenant = await getConvexClient().query(api.tenants.getById, { id: tenantId });
  return reviveDates(tenant) as unknown as tenant | null;
}

export async function getTenantWithLease(tenantId: string) {
  const result = await getConvexClient().query(api.tenants.getWithLease, { id: tenantId });
  return reviveDates(result) as unknown as {
    tenant: tenant | null;
    lease: (lease & { property: property | null }) | null;
    property: property | null;
  };
}

export async function getTenantsByLeaseId(leaseId: string) {
  const tenants = await getConvexClient().query(api.tenants.listByLease, { leaseId });
  return reviveDates(tenants) as unknown as tenant[];
}

export async function getTenantsByPropertyId(propertyId: string) {
  const tenants = await getConvexClient().query(api.tenants.listByProperty, { propertyId });
  return reviveDates(tenants) as unknown as tenant[];
}

export async function getAllTenantsForUser(userId: string) {
  const tenants = await getConvexClient().query(api.tenants.listForUser, { userId });
  return reviveDates(tenants) as unknown as (tenant & {
    lease: (lease & { property: property | null }) | null;
  })[];
}

export async function getAvailableTenantsForUser(userId: string) {
  const tenants = await getConvexClient().query(api.tenants.listAvailableForUser, { userId });
  return reviveDates(tenants) as unknown as tenant[];
}

export async function updateTenantInDb(tenantId: string, userId: string, data: EditTenantFormData) {
  const updated = await getConvexClient().mutation(api.tenants.update, {
    id: tenantId,
    userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    notes: data.notes ?? null,
    leaseId: data.leaseId || null,
  });
  return reviveDates(updated) as unknown as tenant;
}

export async function assignTenantToLease(tenantId: string, leaseId: string | null) {
  const updated = await getConvexClient().mutation(api.tenants.update, {
    id: tenantId,
    leaseId,
  });
  return reviveDates(updated) as unknown as tenant;
}

export async function removeTenantFromLease(tenantId: string) {
  return assignTenantToLease(tenantId, null);
}

export async function deleteTenantFromDb(tenantId: string, userId: string) {
  const deleted = await getConvexClient().mutation(api.tenants.remove, { id: tenantId, userId });
  return reviveDates(deleted) as unknown as tenant;
}

export async function findPropertyForUser(propertyId: string, userId: string) {
  const property = await getConvexClient().query(api.properties.getForUser, {
    id: propertyId,
    userId,
  });
  return reviveDates(property) as unknown as property | null;
}

export async function addTenantToPropertyChannelByLeaseId(leaseId: string, tenantId: string) {
  await getConvexClient().mutation(api.tenants.addToPropertyChannelByLease, { leaseId, tenantId });
}

export async function removeTenantFromPropertyChannelByLeaseId(leaseId: string, tenantId: string) {
  await getConvexClient().mutation(api.tenants.removeFromPropertyChannelByLease, {
    leaseId,
    tenantId,
  });
}

// Legacy function aliases kept for existing call sites
export const editTenantInDb = updateTenantInDb;
export const assignTenantToLeaseInDb = assignTenantToLease;
export const removeTenantFromLeaseInDb = removeTenantFromLease;
export const updateTenantLeaseInDb = assignTenantToLease;
