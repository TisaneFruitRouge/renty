import { prisma } from "@/prisma/db";
import type { LeaseType, LeaseStatus } from "@prisma/client";

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

export async function createLeaseInDb(data: CreateLeaseData) {
  return prisma.lease.create({
    data: {
      propertyId: data.propertyId,
      startDate: data.startDate,
      endDate: data.endDate,
      rentAmount: data.rentAmount,
      depositAmount: data.depositAmount,
      charges: data.charges || 0,
      leaseType: data.leaseType,
      isFurnished: data.isFurnished || false,
      paymentFrequency: data.paymentFrequency || "monthly",
      currency: data.currency || "EUR",
      status: data.status || "ACTIVE",
      notes: data.notes,
      autoGenerateReceipts: data.autoGenerateReceipts || false,
      receiptGenerationDate: data.receiptGenerationDate,
      nextReceiptDate: data.nextReceiptDate,
    },
    include: {
      property: true,
      tenants: true,
    },
  });
}

export async function getLeaseById(leaseId: string) {
  return prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      property: true,
      tenants: {
        include: {
          auth: true,
        },
      },
    },
  });
}

export async function getLeasesByPropertyId(propertyId: string) {
  return prisma.lease.findMany({
    where: { propertyId },
    include: {
      tenants: {
        include: {
          auth: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveLeasesByPropertyId(propertyId: string) {
  return prisma.lease.findMany({
    where: {
      propertyId,
      status: "ACTIVE",
    },
    include: {
      tenants: {
        include: {
          auth: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getLeasesForUser(userId: string) {
  return prisma.lease.findMany({
    where: {
      property: {
        userId,
      },
    },
    include: {
      property: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveLeasesForUser(userId: string) {
  return prisma.lease.findMany({
    where: {
      property: {
        userId,
      },
      status: "ACTIVE",
    },
    include: {
      property: true,
      tenants: {
        include: {
          auth: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function updateLeaseInDb(leaseId: string, data: UpdateLeaseData) {
  return prisma.lease.update({
    where: { id: leaseId },
    data,
    include: {
      property: true,
      tenants: {
        include: {
          auth: true,
        },
      },
    },
  });
}

export async function deleteLeaseFromDb(leaseId: string) {
  return prisma.lease.delete({
    where: { id: leaseId },
  });
}

export async function addTenantToLeaseInDb(leaseId: string, tenantId: string) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { leaseId },
  });
}

export async function removeTenantFromLeaseInDb(tenantId: string) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { leaseId: null },
  });
}

export async function getLeaseWithTenants(leaseId: string) {
  return prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      property: {
        include: {
          user: true,
        },
      },
      tenants: {
        include: {
          auth: true,
        },
      },
    },
  });
}

export async function getExpiredLeases() {
  return prisma.lease.findMany({
    where: {
      endDate: {
        lt: new Date(),
      },
      status: "ACTIVE",
    },
    include: {
      property: true,
      tenants: true,
    },
  });
}

export async function getLeasesByStatus(status: LeaseStatus) {
  return prisma.lease.findMany({
    where: { status },
    include: {
      property: true,
      tenants: {
        include: {
          auth: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLeaseStatus(leaseId: string, status: LeaseStatus) {
  return prisma.lease.update({
    where: { id: leaseId },
    data: { status },
  });
}

export async function getTenantsAvailableForLease(userId: string) {
  return prisma.tenant.findMany({
    where: {
      userId,
      leaseId: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findLeaseForUser(leaseId: string, userId: string) {
  return prisma.lease.findFirst({
    where: {
      id: leaseId,
      property: {
        userId,
      },
    },
    include: {
      property: true,
      tenants: {
        include: {
          auth: true,
        },
      },
    },
  });
}

export async function getLeaseCountForUser(userId: string): Promise<number> {
  return prisma.lease.count({
    where: {
      property: {
        userId,
      },
    },
  });
}

export async function updateLeaseRentReceiptSettings(
  leaseId: string,
  autoGenerateReceipts: boolean,
  receiptGenerationDate?: number,
  nextReceiptDate?: Date
) {
  return prisma.lease.update({
    where: { id: leaseId },
    data: {
      autoGenerateReceipts,
      receiptGenerationDate,
      nextReceiptDate,
    },
    include: {
      property: true,
      tenants: true,
    },
  });
}

export async function getLeasesRequiringReceiptGeneration() {
  const today = new Date();
  return prisma.lease.findMany({
    where: {
      autoGenerateReceipts: true,
      status: 'ACTIVE',
      nextReceiptDate: {
        lte: today,
      },
      tenants: {
        some: {},
      },
    },
    include: {
      property: {
        include: {
          user: true,
        },
      },
      tenants: {
        include: {
          auth: true,
        },
      },
    },
  });
}

export async function updateNextReceiptDate(leaseId: string, nextDate: Date) {
  return prisma.lease.update({
    where: { id: leaseId },
    data: {
      nextReceiptDate: nextDate,
    },
  });
}

export async function getLeaseWithReceiptSettings(leaseId: string) {
  return prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      property: {
        include: {
          user: true,
        },
      },
      tenants: {
        include: {
          auth: true,
        },
      },
    },
  });
}
