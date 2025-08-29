"use server";

import { revalidatePath } from "next/cache";
import { addUserIdToAction } from "@/lib/helpers";
import { generateRandomCode } from "@/features/auth/lib";
import { hash } from "bcryptjs";
import { prisma } from "@/prisma/db";
import type { CreateTenantFormData } from "./components/CreateTenantForm";
import type { EditTenantFormData } from "./components/EditTenantForm";
import {
  createTenantInDb,
  createTenantAuthInDb,
  getAllTenantsForUser,
  getAvailableTenantsForUser,
  getTenantById,
  getTenantWithLease,
  updateTenantInDb,
  assignTenantToLease,
  removeTenantFromLease,
  deleteTenantFromDb,
  addTenantToPropertyChannelByLeaseId,
  removeTenantFromPropertyChannelByLeaseId,
  getTenantsByPropertyId
} from './db';

export const createTenant = addUserIdToAction(async (userId: string, data: CreateTenantFormData) => {
  const tenant = await createTenantInDb({ ...data, userId });

  const tempCode = generateRandomCode(6);
  const hashedTempCode = await hash(tempCode, 10);
  await createTenantAuthInDb(tenant.id, tenant.phoneNumber, hashedTempCode);

  // If leaseId is provided, add tenant to property channel
  if (data.leaseId) {
    await addTenantToPropertyChannelByLeaseId(data.leaseId, tenant.id);
  }

  // TODO: send code to tenant's phone number
  // await sendSMS(tenant.phoneNumber, `Your access code is: ${tempCode}`);

  revalidatePath('/tenants');
  if (data.leaseId) {
    const lease = await prisma.lease.findUnique({
      where: { id: data.leaseId },
      select: { propertyId: true }
    });
    if (lease) {
      revalidatePath(`/properties/${lease.propertyId}`);
    }
  }
  return tenant;
});

export async function getTenantByPropertyId(propertyId: string) {
  const tenants = await getTenantsByPropertyId(propertyId);
  return tenants[0] || null;
}

export const getAvailableTenants = addUserIdToAction(async (userId: string) => {
  return getAvailableTenantsForUser(userId);
});

export const getAllTenants = addUserIdToAction(async (userId: string) => {
  return getAllTenantsForUser(userId);
});

export const editTenant = addUserIdToAction(async (userId: string, tenantId: string, data: EditTenantFormData) => {
  // Get current tenant to check lease changes
  const currentTenant = await getTenantById(tenantId);
  if (!currentTenant || currentTenant.userId !== userId) {
    throw new Error("Tenant not found or access denied");
  }

  const oldLeaseId = currentTenant.leaseId;
  const newLeaseId = data.leaseId || null;

  // Update tenant
  const tenant = await updateTenantInDb(tenantId, userId, data);

  // Handle channel participation changes
  if (oldLeaseId !== newLeaseId) {
    // Remove from old lease's property channel
    if (oldLeaseId) {
      await removeTenantFromPropertyChannelByLeaseId(oldLeaseId, tenantId);
    }

    // Add to new lease's property channel
    if (newLeaseId) {
      await addTenantToPropertyChannelByLeaseId(newLeaseId, tenantId);
    }
  }

  revalidatePath('/tenants');
  
  // Revalidate both old and new properties if applicable
  if (oldLeaseId) {
    const oldLease = await prisma.lease.findUnique({
      where: { id: oldLeaseId },
      select: { propertyId: true }
    });
    if (oldLease) {
      revalidatePath(`/properties/${oldLease.propertyId}`);
    }
  }
  
  if (newLeaseId) {
    const newLease = await prisma.lease.findUnique({
      where: { id: newLeaseId },
      select: { propertyId: true }
    });
    if (newLease) {
      revalidatePath(`/properties/${newLease.propertyId}`);
    }
  }

  return tenant;
});

export const deleteTenant = addUserIdToAction(async (userId: string, tenantId: string) => {
  // Get tenant details before deletion
  const tenantWithLease = await getTenantWithLease(tenantId);
  
  if (!tenantWithLease.tenant || tenantWithLease.tenant.userId !== userId) {
    throw new Error("Tenant not found or access denied");
  }

  // Remove from property channel if assigned to a lease
  if (tenantWithLease.tenant.leaseId) {
    await removeTenantFromPropertyChannelByLeaseId(tenantWithLease.tenant.leaseId, tenantId);
  }

  const tenant = await deleteTenantFromDb(tenantId, userId);

  revalidatePath('/tenants');
  if (tenantWithLease.property) {
    revalidatePath(`/properties/${tenantWithLease.property.id}`);
  }
  
  return tenant;
});

export const assignTenantToLeaseAction = addUserIdToAction(async (userId: string, leaseId: string, tenantId: string) => {
  // Verify lease belongs to user
  const lease = await prisma.lease.findFirst({
    where: {
      id: leaseId,
      property: {
        userId
      }
    },
    include: { property: true }
  });
  
  if (!lease) {
    throw new Error("Lease not found or access denied");
  }

  // Verify tenant belongs to user
  const tenant = await getTenantById(tenantId);
  if (!tenant || tenant.userId !== userId) {
    throw new Error("Tenant not found or access denied");
  }

  // Remove from old lease channel if applicable
  if (tenant.leaseId) {
    await removeTenantFromPropertyChannelByLeaseId(tenant.leaseId, tenantId);
  }

  // Assign tenant to lease
  await assignTenantToLease(tenantId, leaseId);

  // Add to new property channel
  await addTenantToPropertyChannelByLeaseId(leaseId, tenantId);

  revalidatePath('/tenants');
  revalidatePath('/leases');
  revalidatePath(`/properties/${lease.propertyId}`);

  return { success: true };
});

export const removeTenantFromLeaseAction = addUserIdToAction(async (userId: string, tenantId: string) => {
  // Get tenant with lease info
  const tenantWithLease = await getTenantWithLease(tenantId);
  
  if (!tenantWithLease.tenant || tenantWithLease.tenant.userId !== userId) {
    throw new Error("Tenant not found or access denied");
  }

  if (!tenantWithLease.tenant.leaseId) {
    throw new Error("Tenant is not assigned to any lease");
  }

  // Remove from property channel
  await removeTenantFromPropertyChannelByLeaseId(tenantWithLease.tenant.leaseId, tenantId);

  // Remove from lease
  await removeTenantFromLease(tenantId);

  revalidatePath('/tenants');
  revalidatePath('/leases');
  if (tenantWithLease.property) {
    revalidatePath(`/properties/${tenantWithLease.property.id}`);
  }

  return { success: true };
});

// Helper to get tenant details with lease information
export const getTenantDetails = addUserIdToAction(async (userId: string, tenantId: string) => {
  const tenantWithLease = await getTenantWithLease(tenantId);
  
  if (!tenantWithLease.tenant || tenantWithLease.tenant.userId !== userId) {
    throw new Error("Tenant not found or access denied");
  }

  return tenantWithLease;
});

// Get all active leases for tenant forms
export const getActiveLeasesForUser = addUserIdToAction(async (userId: string) => {
  return prisma.lease.findMany({
    where: {
      property: {
        userId
      },
      status: 'ACTIVE'
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          address: true,
          city: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
});