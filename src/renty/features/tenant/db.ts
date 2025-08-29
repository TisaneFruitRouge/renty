import { prisma } from "@/prisma/db";
import type { CreateTenantFormData } from "./components/CreateTenantForm";
import type { EditTenantFormData } from "./components/EditTenantForm";

export async function createTenantInDb(data: CreateTenantFormData & { userId: string }) {
  const tenant = await prisma.tenant.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      notes: data.notes,
      leaseId: data.leaseId || null,
      userId: data.userId
    },
  });
  return tenant;
}

export async function createTenantAuthInDb(tenantId: string, phoneNumber: string, hashedTempCode: string) {
  return prisma.tenantAuth.create({
    data: {
      tenantId,
      phoneNumber,
      tempCode: hashedTempCode,
      tempCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      passcode: ''
    }
  });
}

export async function getTenantById(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId }
  });
}

export async function getTenantWithLease(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });
  
  if (!tenant || !tenant.leaseId) {
    return { tenant, lease: null, property: null };
  }
  
  const lease = await prisma.lease.findUnique({
    where: { id: tenant.leaseId },
    include: {
      property: true
    }
  });
  
  return {
    tenant,
    lease: lease || null,
    property: lease?.property || null
  };
}

export async function getTenantsByLeaseId(leaseId: string) {
  return prisma.tenant.findMany({
    where: {
      leaseId: leaseId
    }
  });
}

export async function getTenantsByPropertyId(propertyId: string) {
  // Find all tenants through their leases for a given property
  const leases = await prisma.lease.findMany({
    where: { propertyId },
    include: {
      tenants: true
    }
  });
  
  return leases.flatMap(lease => lease.tenants);
}

export async function getAllTenantsForUser(userId: string) {
  return prisma.tenant.findMany({
    where: {
      userId
    },
    include: {
      lease: {
        include: {
          property: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getAvailableTenantsForUser(userId: string) {
  return prisma.tenant.findMany({
    where: {
      leaseId: null,
      userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function updateTenantInDb(tenantId: string, userId: string, data: EditTenantFormData) {
  return prisma.tenant.update({
    where: {
      id: tenantId,
      userId
    },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      notes: data.notes,
      leaseId: data.leaseId || null,
    },
  });
}

export async function assignTenantToLease(tenantId: string, leaseId: string | null) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { leaseId }
  });
}

export async function removeTenantFromLease(tenantId: string) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { leaseId: null }
  });
}

export async function deleteTenantFromDb(tenantId: string, userId: string) {
  return prisma.tenant.delete({
    where: {
      id: tenantId,
      userId
    },
  });
}

export async function findPropertyForUser(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: {
      id: propertyId,
      userId
    }
  });
}

// Channel management helpers
export async function addTenantToPropertyChannelByLeaseId(leaseId: string, tenantId: string) {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: { propertyId: true }
  });
  
  if (!lease) return;
  
  const channel = await prisma.channel.findFirst({
    where: { propertyId: lease.propertyId }
  });
  
  if (!channel) return;
  
  // Check if participant already exists
  const existingParticipant = await prisma.channelParticipant.findFirst({
    where: {
      channelId: channel.id,
      participantId: tenantId,
      participantType: 'TENANT'
    }
  });
  
  if (!existingParticipant) {
    await prisma.channelParticipant.create({
      data: {
        channelId: channel.id,
        participantId: tenantId,
        participantType: 'TENANT'
      }
    });
  }
}

export async function removeTenantFromPropertyChannelByLeaseId(leaseId: string, tenantId: string) {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: { propertyId: true }
  });
  
  if (!lease) return;
  
  const channel = await prisma.channel.findFirst({
    where: { propertyId: lease.propertyId }
  });
  
  if (!channel) return;
  
  await prisma.channelParticipant.deleteMany({
    where: {
      channelId: channel.id,
      participantId: tenantId,
      participantType: 'TENANT'
    }
  });
}

// Legacy function names for backward compatibility (if needed elsewhere)
export const editTenantInDb = updateTenantInDb;
export const assignTenantToLeaseInDb = assignTenantToLease;
export const removeTenantFromLeaseInDb = removeTenantFromLease;
export const updateTenantLeaseInDb = assignTenantToLease;