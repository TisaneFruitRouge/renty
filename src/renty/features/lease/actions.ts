"use server";

import { revalidatePath } from "next/cache";
import { addUserIdToAction } from "@/lib/helpers";
import {
  createLeaseInDb,
  getLeasesByPropertyId,
  getActiveLeasesByPropertyId,
  getLeasesForUser,
  getActiveLeasesForUser,
  updateLeaseInDb,
  deleteLeaseFromDb,
  addTenantToLeaseInDb,
  removeTenantFromLeaseInDb,
  getTenantsAvailableForLease,
  findLeaseForUser,
  updateLeaseStatus,
  getLeaseCountForUser,
  updateLeaseRentReceiptSettings,
  getLeaseWithReceiptSettings,
  terminateLeaseInDb,
  renewLeaseInDb,
  type CreateLeaseData,
  type UpdateLeaseData,
} from "./db";
import type { TerminationReason } from "@prisma/client";
import { findPropertyForUser } from "@/features/tenant/db";
import { addTenantToPropertyChannel } from "@/features/messages/db";
import { prisma } from "@/prisma/db";


export const createLease = addUserIdToAction(async (userId: string, data: CreateLeaseData) => {
  // Verify the property belongs to the user
  const property = await findPropertyForUser(data.propertyId, userId);
  if (!property) {
    throw new Error("Property not found or access denied");
  }

  const lease = await createLeaseInDb(data);

  revalidatePath('/leases');
  revalidatePath(`/properties/${data.propertyId}`);
  return lease;
});

export const updateLease = addUserIdToAction(async (userId: string, leaseId: string, data: UpdateLeaseData) => {
  // Verify the lease belongs to the user
  const existingLease = await findLeaseForUser(leaseId, userId);
  if (!existingLease) {
    throw new Error("Lease not found or access denied");
  }

  const lease = await updateLeaseInDb(leaseId, data);

  revalidatePath('/leases');
  revalidatePath(`/properties/${lease.propertyId}`);
  revalidatePath(`/leases/${leaseId}`);
  return lease;
});

export const deleteLease = addUserIdToAction(async (userId: string, leaseId: string) => {
  // Verify the lease belongs to the user
  const existingLease = await findLeaseForUser(leaseId, userId);
  if (!existingLease) {
    throw new Error("Lease not found or access denied");
  }

  // Remove all tenants from the lease first
  for (const tenant of existingLease.tenants) {
    await removeTenantFromLeaseInDb(tenant.id);
  }

  await deleteLeaseFromDb(leaseId);

  revalidatePath('/leases');
  revalidatePath(`/properties/${existingLease.propertyId}`);
  return { success: true };
});

export const addTenantToLease = addUserIdToAction(async (userId: string, leaseId: string, tenantId: string) => {
  // Verify the lease belongs to the user
  const lease = await findLeaseForUser(leaseId, userId);
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }

  // Verify the tenant belongs to the user
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      userId,
    },
  });
  if (!tenant) {
    throw new Error("Tenant not found or access denied");
  }

  // Add tenant to lease
  await addTenantToLeaseInDb(leaseId, tenantId);

  // Add tenant to property channel
  await addTenantToPropertyChannel(lease.propertyId, tenantId);

  revalidatePath('/tenants');
  revalidatePath('/leases');
  revalidatePath(`/properties/${lease.propertyId}`);
  revalidatePath(`/leases/${leaseId}`);

  return { success: true };
});

export const removeTenantFromLease = addUserIdToAction(async (userId: string, tenantId: string) => {
  // Get the tenant with lease info
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      userId,
    },
  });

  if (!tenant || !tenant.leaseId) {
    throw new Error("Tenant not found or not associated with any lease");
  }

  // Get the lease to find the property
  const lease = await prisma.lease.findUnique({
    where: { id: tenant.leaseId },
    include: { property: true }
  });

  if (!lease) {
    throw new Error("Associated lease not found");
  }

  // Remove tenant from property channel
  const channel = await prisma.channel.findFirst({
    where: { propertyId: lease.propertyId },
  });

  if (channel) {
    await prisma.channelParticipant.deleteMany({
      where: {
        channelId: channel.id,
        participantId: tenantId,
        participantType: 'TENANT',
      },
    });
  }

  // Remove tenant from lease
  await removeTenantFromLeaseInDb(tenantId);

  revalidatePath('/tenants');
  revalidatePath('/leases');
  revalidatePath(`/properties/${lease.propertyId}`);
  revalidatePath(`/leases/${lease.id}`);

  return { success: true };
});

export const getLeasesByProperty = addUserIdToAction(async (userId: string, propertyId: string) => {
  // Verify the property belongs to the user
  const property = await findPropertyForUser(propertyId, userId);
  if (!property) {
    throw new Error("Property not found or access denied");
  }

  return getLeasesByPropertyId(propertyId);
});

export const getActiveLeasesByProperty = addUserIdToAction(async (userId: string, propertyId: string) => {
  // Verify the property belongs to the user
  const property = await findPropertyForUser(propertyId, userId);
  if (!property) {
    throw new Error("Property not found or access denied");
  }

  return getActiveLeasesByPropertyId(propertyId);
});

export const getUserLeases = addUserIdToAction(async (userId: string) => {
  return getLeasesForUser(userId);
});

export const getUserActiveLeases = addUserIdToAction(async (userId: string) => {
  return getActiveLeasesForUser(userId);
});

export const getAllLeases = addUserIdToAction(async (userId: string) => {
  return getLeasesForUser(userId);
});

export const getLease = addUserIdToAction(async (userId: string, leaseId: string) => {
  const lease = await findLeaseForUser(leaseId, userId);
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }
  return lease;
});

export const getAvailableTenantsForLease = addUserIdToAction(async (userId: string) => {
  return getTenantsAvailableForLease(userId);
});

export const updateLeaseStatusAction = addUserIdToAction(async (userId: string, leaseId: string, status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING') => {
  // Verify the lease belongs to the user
  const lease = await findLeaseForUser(leaseId, userId);
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }

  const updatedLease = await updateLeaseStatus(leaseId, status);

  revalidatePath('/leases');
  revalidatePath(`/properties/${lease.propertyId}`);
  revalidatePath(`/leases/${leaseId}`);

  return updatedLease;
});

export const getLeaseCountAction = addUserIdToAction(async (userId: string) => {
  return { success: true, data: await getLeaseCountForUser(userId) };
});

export const updateLeaseRentReceiptSettingsAction = addUserIdToAction(async (
  userId: string, 
  leaseId: string, 
  autoGenerateReceipts: boolean, 
  receiptGenerationDate?: number
) => {
  // Verify the lease belongs to the user
  const lease = await findLeaseForUser(leaseId, userId);
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }

  // Calculate next receipt date if auto generation is enabled
  let nextReceiptDate: Date | undefined;
  if (autoGenerateReceipts && receiptGenerationDate) {
    const now = new Date();
    nextReceiptDate = new Date(now.getFullYear(), now.getMonth(), receiptGenerationDate);
    
    // If the date has already passed this month, set it for next month
    if (nextReceiptDate < now) {
      nextReceiptDate = new Date(now.getFullYear(), now.getMonth() + 1, receiptGenerationDate);
    }
  }

  const updatedLease = await updateLeaseRentReceiptSettings(
    leaseId,
    autoGenerateReceipts,
    receiptGenerationDate,
    nextReceiptDate
  );

  revalidatePath('/leases');
  revalidatePath(`/leases/${leaseId}`);
  revalidatePath(`/properties/${lease.propertyId}`);

  return { success: true, data: updatedLease };
});

export const deleteLeaseRentReceiptSettingsAction = addUserIdToAction(async (userId: string, leaseId: string) => {
  // Verify the lease belongs to the user
  const lease = await findLeaseForUser(leaseId, userId);
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }

  const updatedLease = await updateLeaseRentReceiptSettings(
    leaseId,
    false,
    undefined,
    undefined
  );

  revalidatePath('/leases');
  revalidatePath(`/leases/${leaseId}`);
  revalidatePath(`/properties/${lease.propertyId}`);

  return { success: true, data: updatedLease };
});

export const getLeaseRentReceiptSettingsAction = addUserIdToAction(async (userId: string, leaseId: string) => {
  // Verify the lease belongs to the user
  const lease = await findLeaseForUser(leaseId, userId);
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }

  const leaseWithSettings = await getLeaseWithReceiptSettings(leaseId);
  
  return { 
    success: true, 
    data: {
      autoGenerateReceipts: leaseWithSettings?.autoGenerateReceipts || false,
      receiptGenerationDate: leaseWithSettings?.receiptGenerationDate,
      nextReceiptDate: leaseWithSettings?.nextReceiptDate,
    }
  };
});

export const terminateLeaseAction = addUserIdToAction(async (
  userId: string,
  leaseId: string,
  terminationDate: Date,
  terminationReason: TerminationReason,
  notes?: string
) => {
  const lease = await findLeaseForUser(leaseId, userId);
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }

  if (lease.status !== "ACTIVE" && lease.status !== "PENDING") {
    throw new Error("Only active or pending leases can be terminated");
  }

  const updated = await terminateLeaseInDb(leaseId, terminationDate, terminationReason, notes);

  revalidatePath('/leases');
  revalidatePath(`/leases/${leaseId}`);
  revalidatePath(`/properties/${lease.propertyId}`);

  return updated;
});

export const renewLeaseAction = addUserIdToAction(async (
  userId: string,
  oldLeaseId: string,
  newLeaseData: CreateLeaseData
) => {
  const lease = await findLeaseForUser(oldLeaseId, userId);
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }

  const property = await findPropertyForUser(newLeaseData.propertyId, userId);
  if (!property) {
    throw new Error("Property not found or access denied");
  }

  const { newLease } = await renewLeaseInDb(oldLeaseId, newLeaseData);

  // Add transferred tenants to property channel
  for (const tenant of newLease.tenants) {
    await addTenantToPropertyChannel(newLease.propertyId, tenant.id);
  }

  revalidatePath('/leases');
  revalidatePath(`/leases/${oldLeaseId}`);
  revalidatePath(`/leases/${newLease.id}`);
  revalidatePath(`/properties/${newLease.propertyId}`);

  return { newLeaseId: newLease.id };
});

// Helper function to get lease details for a specific tenant (for mobile app)
export async function getLeaseForTenant(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant || !tenant.leaseId) {
    return null;
  }

  return prisma.lease.findUnique({
    where: { id: tenant.leaseId },
    include: {
      property: {
        include: {
          user: true,
        },
      },
      tenants: true,
    },
  });
}
