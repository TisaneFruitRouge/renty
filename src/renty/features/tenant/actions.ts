"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { addTenantToPropertyChannel } from "@/features/messages/db"
import { generateRandomCode, hash } from "@/features/auth/lib"
import { CreateTenantFormData } from "./components/CreateTenantForm"
import { EditTenantFormData } from "./components/EditTenantForm"
import {
  createTenantInDb,
  createTenantAuthInDb,
  getTenantsByPropertyId,
  getAllTenantsForUser,
  getAvailableTenantsForUser,
  updateTenantPropertyInDb,
  editTenantInDb,
  deleteTenantFromDb,
  findPropertyForUser,
  assignTenantToPropertyInDb,
  removeTenantFromPropertyInDb
} from './db'

export async function createTenant(data: CreateTenantFormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const tenant = await createTenantInDb({ ...data, userId: session.user.id });

  const tempCode = generateRandomCode(6);
  await createTenantAuthInDb(tenant.id, tenant.phoneNumber, await hash(tempCode));

  // If propertyId is provided, add tenant to property channel
  if (data.propertyId) {
    await addTenantToPropertyChannel(data.propertyId, tenant.id);
  }

  // TODO: send code to tenant's phone number

  revalidatePath('/tenants')
  revalidatePath(`/properties/${data.propertyId}`)
  revalidatePath('/channels')
  return tenant
}

export async function getTenantByPropertyId(propertyId: string) {
  const tenants = await getTenantsByPropertyId(propertyId);
  return tenants[0];
}

export async function getAllTenants() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return getAllTenantsForUser(session.user.id);
}

export async function getAvailableTenants() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  return getAvailableTenantsForUser(session.user.id);
}

export async function updateTenantProperty(tenantId: string, propertyId: string) {
  const tenant = await updateTenantPropertyInDb(tenantId, propertyId);

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

  const tenant = await editTenantInDb(tenantId, session.user.id, data);

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

  const tenant = await deleteTenantFromDb(tenantId, session.user.id);

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
  const property = await findPropertyForUser(propertyId, session.user.id);

  if (!property) {
    throw new Error("Property not found or unauthorized");
  }

  const tenant = await assignTenantToPropertyInDb(tenantId, session.user.id, propertyId);

  // Add tenant to the property's channel
  await addTenantToPropertyChannel(propertyId, tenantId);

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
  revalidatePath('/channels')
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
  const property = await findPropertyForUser(propertyId, session.user.id);

  if (!property) {
    throw new Error("Property not found or unauthorized");
  }

  const tenant = await removeTenantFromPropertyInDb(tenantId, session.user.id, propertyId);

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
  return tenant
}