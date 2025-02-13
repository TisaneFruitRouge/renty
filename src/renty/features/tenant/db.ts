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
      propertyId: data.propertyId,
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

export async function getTenantsByPropertyId(propertyId: string) {
  return prisma.tenant.findMany({
    where: {
      propertyId
    }
  });
}

export async function getAllTenantsForUser(userId: string) {
  return prisma.tenant.findMany({
    where: {
      userId
    },
    include: {
      property: true
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getAvailableTenantsForUser(userId: string) {
  return prisma.tenant.findMany({
    where: {
      propertyId: undefined,
      userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function updateTenantPropertyInDb(tenantId: string, propertyId: string | null) {
  // Get the current tenant to check their previous property
  const currentTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { propertyId: true }
  });

  // If there was a previous property, remove tenant from that property's channel
  if (currentTenant?.propertyId) {
    const previousChannel = await prisma.channel.findFirst({
      where: { propertyId: currentTenant.propertyId }
    });
    if (previousChannel) {
      await prisma.channelParticipant.deleteMany({
        where: {
          channelId: previousChannel.id,
          participantId: tenantId,
          participantType: 'TENANT'
        }
      });
    }
  }

  // Update the tenant's property
  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { propertyId },
  });

  // If there's a new property, add tenant to that property's channel
  if (propertyId) {
    const newChannel = await prisma.channel.findFirst({
      where: { propertyId }
    });
    if (newChannel) {
      await prisma.channelParticipant.create({
        data: {
          channelId: newChannel.id,
          participantId: tenantId,
          participantType: 'TENANT'
        }
      });
    }
  }

  return updatedTenant;
}

export async function editTenantInDb(tenantId: string, userId: string, data: EditTenantFormData) {
  // Get the current tenant to check their previous property
  const currentTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { propertyId: true }
  });

  // Handle property channel changes if the property is being updated
  if (data.propertyId !== currentTenant?.propertyId) {
    // If there was a previous property, remove tenant from that property's channel
    if (currentTenant?.propertyId) {
      const previousChannel = await prisma.channel.findFirst({
        where: { propertyId: currentTenant.propertyId }
      });
      if (previousChannel) {
        await prisma.channelParticipant.deleteMany({
          where: {
            channelId: previousChannel.id,
            participantId: tenantId,
            participantType: 'TENANT'
          }
        });
      }
    }

    // If there's a new property, add tenant to that property's channel
    if (data.propertyId) {
      const newChannel = await prisma.channel.findFirst({
        where: { propertyId: data.propertyId }
      });
      if (newChannel) {
        await prisma.channelParticipant.create({
          data: {
            channelId: newChannel.id,
            participantId: tenantId,
            participantType: 'TENANT'
          }
        });
      }
    }
  }

  // Update the tenant's information
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
      propertyId: data.propertyId,
      startDate: data.startDate
    },
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

export async function assignTenantToPropertyInDb(tenantId: string, userId: string, propertyId: string) {
  return prisma.tenant.update({
    where: {
      id: tenantId,
      userId
    },
    data: {
      propertyId
    }
  });
}

export async function removeTenantFromPropertyInDb(tenantId: string, userId: string, propertyId: string) {
  return prisma.tenant.update({
    where: {
      id: tenantId,
      userId,
      propertyId
    },
    data: {
      propertyId: null
    }
  });
}