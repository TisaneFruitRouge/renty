"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { generateRandomCode, hash } from "@/features/auth/lib"
import { CreateTenantFormData } from "./components/CreateTenantForm"
import { EditTenantFormData } from "./components/EditTenantForm"

export async function createTenant(data: CreateTenantFormData) {

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
  });

  const tempCode = generateRandomCode(6);
  
  // 3. Create TenantAuth record
  await prisma.tenantAuth.create({
    data: {
      tenantId: tenant.id,
      phoneNumber: tenant.phoneNumber,
      tempCode: await hash(tempCode),
      tempCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      passcode: ''
    }
  });

  // TODO: send code to tenant's phone number

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
    include: {
      property: true
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

export async function editTenant(tenantId: string, data: EditTenantFormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const tenant = await prisma.tenant.update({
    where: {
      id: tenantId,
      userId: session.user.id
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
  })

  revalidatePath('/tenants')
  if (data.propertyId) {
    revalidatePath(`/properties/${data.propertyId}`)
  }
  return tenant
}

export async function deleteTenant(tenantId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const tenant = await prisma.tenant.delete({
    where: {
      id: tenantId,
      userId: session.user.id
    },
  })

  revalidatePath('/tenants')
  if (tenant.propertyId) {
    revalidatePath(`/properties/${tenant.propertyId}`)
  }
  return tenant
}

export async function assignTenantToProperty(propertyId: string, tenantId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // Check if property belongs to user
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      userId: session.user.id
    }
  })

  if (!property) {
    throw new Error("Property not found or unauthorized");
  }

  const tenant = await prisma.tenant.update({
    where: {
      id: tenantId,
      userId: session.user.id
    },
    data: {
      propertyId
    }
  })

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
  return tenant
}

export async function removeTenantFromProperty(propertyId: string, tenantId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // Check if property belongs to user
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      userId: session.user.id
    }
  })

  if (!property) {
    throw new Error("Property not found or unauthorized");
  }

  const tenant = await prisma.tenant.update({
    where: {
      id: tenantId,
      userId: session.user.id,
      propertyId
    },
    data: {
      propertyId: null
    }
  })

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
  return tenant
}
