"use server"

import { revalidatePath } from "next/cache"
import { addTenantToPropertyChannel } from "@/features/messages/db"
import { generateRandomCode, hash } from "@/features/auth/lib"
import { CreateTenantFormData } from "./components/CreateTenantForm"
import { EditTenantFormData } from "./components/EditTenantForm"
import { addUserIdToAction } from "@/lib/helpers"
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

export const createTenant = addUserIdToAction(async (userId: string, data: CreateTenantFormData) => {
  const tenant = await createTenantInDb({ ...data, userId });

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
});

export async function getTenantByPropertyId(propertyId: string) {
  const tenants = await getTenantsByPropertyId(propertyId);
  return tenants[0];
}

export const getAllTenants = addUserIdToAction(async (userId: string) => {
  return getAllTenantsForUser(userId);
});

export const getAvailableTenants = addUserIdToAction(async (userId: string) => {
  return getAvailableTenantsForUser(userId);
});

export async function updateTenantProperty(tenantId: string, propertyId: string) {
  const tenant = await updateTenantPropertyInDb(tenantId, propertyId);

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
  return tenant
}

export const editTenant = addUserIdToAction(async (userId: string, tenantId: string, data: EditTenantFormData) => {
  const tenant = await editTenantInDb(tenantId, userId, data);

  revalidatePath('/tenants')
  if (data.propertyId) {
    revalidatePath(`/properties/${data.propertyId}`)
  }
  return tenant
});

export const deleteTenant = addUserIdToAction(async (userId: string, tenantId: string) => {
  const tenant = await deleteTenantFromDb(tenantId, userId);

  revalidatePath('/tenants')
  if (tenant.propertyId) {
    revalidatePath(`/properties/${tenant.propertyId}`)
  }
  return tenant
});

export const assignTenantToProperty = addUserIdToAction(async (userId: string, propertyId: string, tenantId: string) => {
  // Check if property belongs to user
  const property = await findPropertyForUser(propertyId, userId);

  if (!property) {
    throw new Error("Property not found or unauthorized");
  }

  const tenant = await assignTenantToPropertyInDb(tenantId, userId, propertyId);

  // Add tenant to the property's channel
  await addTenantToPropertyChannel(propertyId, tenantId);

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
  revalidatePath('/channels')
  return tenant
});

export const removeTenantFromProperty = addUserIdToAction(async (userId: string, propertyId: string, tenantId: string) => {
  // Check if property belongs to user
  const property = await findPropertyForUser(propertyId, userId);

  if (!property) {
    throw new Error("Property not found or unauthorized");
  }

  const tenant = await removeTenantFromPropertyInDb(tenantId, userId, propertyId);

  revalidatePath('/tenants')
  revalidatePath(`/properties/${propertyId}`)
  return tenant
});