import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { getLandlordById } from "./authUsers";

const PAYMENT_MULTIPLIER: Record<string, number> = {
  biweekly: 2.17,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

function appId(doc: { prismaId?: string | null; _id: string }) {
  return doc.prismaId ?? doc._id;
}

function shapeProperty(doc: Doc<"properties">) {
  const { _creationTime, ...rest } = doc;
  return { ...rest, id: appId(doc) };
}

function shapeLease(doc: Doc<"leases">) {
  const { _creationTime, ...rest } = doc;
  return { ...rest, id: appId(doc) };
}

function shapeTenant(doc: Doc<"tenants">) {
  const { _creationTime, ...rest } = doc;
  return { ...rest, id: appId(doc) };
}

async function tenantsForLease(ctx: QueryCtx, leaseId: string) {
  const tenants = await ctx.db
    .query("tenants")
    .withIndex("by_lease", (q) => q.eq("leaseId", leaseId))
    .collect();
  return tenants.map(shapeTenant);
}

async function leasesWithTenants(ctx: QueryCtx, propertyId: string) {
  const leases = await ctx.db
    .query("leases")
    .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
    .collect();
  return Promise.all(
    leases.map(async (lease) => ({
      ...shapeLease(lease),
      tenants: await tenantsForLease(ctx, appId(lease)),
    })),
  );
}

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      properties.map(async (property) => ({
        ...shapeProperty(property),
        leases: await leasesWithTenants(ctx, appId(property)),
      })),
    );
  },
});

async function findById(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("properties")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("properties", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const property = await findById(ctx, id);
    return property ? shapeProperty(property) : null;
  },
});

export const getForUser = query({
  args: { id: v.string(), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const property = await findById(ctx, id);
    if (!property || property.userId !== userId) return null;
    return shapeProperty(property);
  },
});

export const getReceiptContext = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const property = await findById(ctx, id);
    if (!property) return null;

    const leases = (await leasesWithTenants(ctx, appId(property))).filter(
      (lease) => lease.status === "ACTIVE",
    );

    return {
      ...shapeProperty(property),
      leases,
      user: await getLandlordById(ctx, property.userId),
    };
  },
});

export const countForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return properties.length;
  },
});

export const monthlyRevenue = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let total = 0;
    for (const property of properties) {
      const leases = await ctx.db
        .query("leases")
        .withIndex("by_property", (q) => q.eq("propertyId", appId(property)))
        .collect();
      for (const lease of leases) {
        if (lease.status !== "ACTIVE" || !lease.rentAmount) continue;
        const multiplier = PAYMENT_MULTIPLIER[lease.paymentFrequency] ?? 0;
        total += (lease.rentAmount + (lease.charges ?? 0)) * multiplier;
      }
    }
    return total;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    postalCode: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const propertyId = crypto.randomUUID();

    await ctx.db.insert("properties", {
      prismaId: propertyId,
      userId: args.userId,
      title: args.title,
      address: args.address,
      city: args.city,
      state: args.state,
      country: args.country,
      postalCode: args.postalCode,
      images: [],
      createdAt: now,
      updatedAt: now,
    });

    // Atomically create the property's message channel with the landlord as a participant.
    const channelId = crypto.randomUUID();
    await ctx.db.insert("channels", {
      prismaId: channelId,
      propertyId,
      type: "PROPERTY",
      name: null,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("channelParticipants", {
      prismaId: crypto.randomUUID(),
      channelId,
      participantId: args.userId,
      participantType: "LANDLORD",
      joinedAt: now,
      leftAt: null,
    });

    const created = await ctx.db
      .query("properties")
      .withIndex("by_prisma_id", (q) => q.eq("prismaId", propertyId))
      .first();
    return shapeProperty(created!);
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    postalCode: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const property = await findById(ctx, id);
    if (!property) throw new Error("Property not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(property._id, patch);

    const updated = await ctx.db.get(property._id);
    return shapeProperty(updated!);
  },
});
