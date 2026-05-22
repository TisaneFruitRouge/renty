import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { reviveDates } from "@/lib/convex-map";
import type { QueryTypes, property, lease, tenant, user } from "@/lib/types";
import { enforceResourceLimit } from "../subscription/limits";

export type PropertyWithLeases = property & {
  leases: (lease & { tenants: tenant[] })[];
};

export async function getPropertiesForUser(userId: string): Promise<PropertyWithLeases[]> {
  const properties = await getConvexClient().query(api.properties.listForUser, { userId });
  return reviveDates(properties) as unknown as PropertyWithLeases[];
}

export async function getPropertyById(id: string): Promise<property> {
  const property = await getConvexClient().query(api.properties.getById, { id });
  if (!property) {
    throw new Error("Property not found");
  }
  return reviveDates(property) as unknown as property;
}

export async function getPropertyForUser(id: string, userId: string): Promise<property> {
  const property = await getConvexClient().query(api.properties.getForUser, { id, userId });
  if (!property) {
    throw new Error("Property not found");
  }
  return reviveDates(property) as unknown as property;
}

export async function getPropertyReceiptContext(id: string) {
  const property = await getConvexClient().query(api.properties.getReceiptContext, { id });
  return reviveDates(property) as unknown as
    | (property & {
        user: user;
        leases: (lease & { tenants: tenant[] })[];
      })
    | null;
}

export async function updateProperty(
  id: string,
  data: Omit<QueryTypes.propertyUpdateInput, "id" | "createdAt" | "updatedAt">,
): Promise<property> {
  const updated = await getConvexClient().mutation(api.properties.update, {
    id,
    title: data.title as string | undefined,
    images: data.images as string[] | undefined,
    address: data.address as string | undefined,
    city: data.city as string | undefined,
    state: data.state as string | undefined,
    country: data.country as string | undefined,
    postalCode: data.postalCode as string | undefined,
  });
  return reviveDates(updated) as unknown as property;
}

export default async function createProperty(
  userId: string,
  title: string,
  address: string,
  city: string,
  state: string,
  country: string,
  postalCode: string,
) {
  const currentCount = await getConvexClient().query(api.properties.countForUser, { userId });

  // throws if the user has exceeded their plan limit for properties
  await enforceResourceLimit("properties", currentCount);

  const property = await getConvexClient().mutation(api.properties.create, {
    userId,
    title,
    address,
    city,
    state,
    country,
    postalCode,
  });

  return reviveDates(property) as unknown as property;
}

export async function calculateMonthlyRevenue(userId: string): Promise<number> {
  return await getConvexClient().query(api.properties.monthlyRevenue, { userId });
}

export async function getPropertyCount(userId: string): Promise<number> {
  return await getConvexClient().query(api.properties.countForUser, { userId });
}
