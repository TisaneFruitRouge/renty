"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

interface CreateTenantData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  notes?: string
  propertyId: string
}

export async function createTenant(data: CreateTenantData) {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const tenant = await prisma.tenant.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      notes: data.notes,
      propertyId: data.propertyId,
      userId: session.user.id
    },
  })

  revalidatePath('/tenants')
  revalidatePath(`/properties/${data.propertyId}`)
  return tenant
}

export async function getTenantByPropertyId(propertyId: string) {
  return (await prisma.tenant.findMany({
    where: {
      propertyId
    }
  }))[0];
}

export async function getAllTenants() {
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return prisma.tenant.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getAvailableTenants() {
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return prisma.tenant.findMany({
    where: {
      propertyId: undefined,
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function deleteTenant(propertyId: string) {
  await prisma.tenant.deleteMany({
    where: {
      propertyId,
    },
  })

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
}

export async function updateTenantProperty(tenantId: string, propertyId: string) {
  const tenant = await prisma.tenant.update({
    where: {
      id: tenantId,
    },
    data: {
      propertyId,
    },
  })

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
  return tenant
}
