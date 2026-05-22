import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

function appId(doc: { prismaId?: string | null; _id: string }) {
  return doc.prismaId ?? doc._id;
}

function shape<T extends { _id: string; prismaId?: string | null }>(doc: T) {
  const { _creationTime, ...rest } = doc as T & { _creationTime: number };
  return { ...rest, id: appId(doc) };
}

async function tenantById(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("tenants")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("tenants", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

async function leaseById(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("leases")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("leases", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

async function propertyByAppId(ctx: QueryCtx, id: string) {
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
    const tenant = await tenantById(ctx, id);
    return tenant ? shape(tenant) : null;
  },
});

export const getWithLease = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const tenant = await tenantById(ctx, id);
    if (!tenant || !tenant.leaseId) {
      return { tenant: tenant ? shape(tenant) : null, lease: null, property: null };
    }
    const lease = await leaseById(ctx, tenant.leaseId);
    const property = lease ? await propertyByAppId(ctx, lease.propertyId) : null;
    const shapedProperty = property ? shape(property) : null;
    return {
      tenant: shape(tenant),
      lease: lease ? { ...shape(lease), property: shapedProperty } : null,
      property: shapedProperty,
    };
  },
});

export const listByLease = query({
  args: { leaseId: v.string() },
  handler: async (ctx, { leaseId }) => {
    const tenants = await ctx.db
      .query("tenants")
      .withIndex("by_lease", (q) => q.eq("leaseId", leaseId))
      .collect();
    return tenants.map(shape);
  },
});

export const listByProperty = query({
  args: { propertyId: v.string() },
  handler: async (ctx, { propertyId }) => {
    const leases = await ctx.db
      .query("leases")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
    const result: ReturnType<typeof shape>[] = [];
    for (const lease of leases) {
      const tenants = await ctx.db
        .query("tenants")
        .withIndex("by_lease", (q) => q.eq("leaseId", appId(lease)))
        .collect();
      result.push(...tenants.map(shape));
    }
    return result;
  },
});

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tenants = await ctx.db
      .query("tenants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    tenants.sort((a, b) => b.createdAt - a.createdAt);

    return Promise.all(
      tenants.map(async (tenant) => {
        let lease: (ReturnType<typeof shape> & { property: unknown }) | null = null;
        if (tenant.leaseId) {
          const leaseDoc = await leaseById(ctx, tenant.leaseId);
          if (leaseDoc) {
            const property = await propertyByAppId(ctx, leaseDoc.propertyId);
            lease = { ...shape(leaseDoc), property: property ? shape(property) : null };
          }
        }
        return { ...shape(tenant), lease };
      }),
    );
  },
});

export const listAvailableForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tenants = await ctx.db
      .query("tenants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return tenants
      .filter((t) => !t.leaseId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(shape);
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phoneNumber: v.string(),
    notes: v.optional(v.union(v.null(), v.string())),
    leaseId: v.optional(v.union(v.null(), v.string())),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await ctx.db.insert("tenants", {
      prismaId: id,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phoneNumber: args.phoneNumber,
      notes: args.notes ?? null,
      leaseId: args.leaseId ?? null,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
    const created = await tenantById(ctx, id);
    return shape(created!);
  },
});

export const createAuth = mutation({
  args: {
    tenantId: v.string(),
    phoneNumber: v.string(),
    tempCode: v.string(),
    tempCodeExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await ctx.db.insert("tenantAuths", {
      prismaId: id,
      tenantId: args.tenantId,
      phoneNumber: args.phoneNumber,
      tempCode: args.tempCode,
      tempCodeExpiresAt: args.tempCodeExpiresAt,
      passcode: "",
      isActivated: false,
      biometricEnabled: false,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db
      .query("tenantAuths")
      .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
      .first();
    return shape(created!);
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    notes: v.optional(v.union(v.null(), v.string())),
    leaseId: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, { id, userId, ...fields }) => {
    const tenant = await tenantById(ctx, id);
    if (!tenant || (userId !== undefined && tenant.userId !== userId)) {
      throw new Error("tenant not found");
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(tenant._id, patch);
    const updated = await ctx.db.get(tenant._id);
    return shape(updated!);
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const tenant = await tenantById(ctx, id);
    if (!tenant || tenant.userId !== userId) {
      throw new Error("tenant not found");
    }
    const shaped = shape(tenant);
    await ctx.db.delete(tenant._id);
    return shaped;
  },
});

async function channelForProperty(ctx: QueryCtx, propertyId: string) {
  return ctx.db
    .query("channels")
    .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
    .first();
}

export const addToPropertyChannelByLease = mutation({
  args: { leaseId: v.string(), tenantId: v.string() },
  handler: async (ctx, { leaseId, tenantId }) => {
    const lease = await leaseById(ctx, leaseId);
    if (!lease) return;
    const channel = await channelForProperty(ctx, lease.propertyId);
    if (!channel) return;

    const channelAppId = appId(channel);
    const existing = await ctx.db
      .query("channelParticipants")
      .withIndex("by_channel", (q) => q.eq("channelId", channelAppId))
      .filter((q) =>
        q.and(
          q.eq(q.field("participantId"), tenantId),
          q.eq(q.field("participantType"), "TENANT"),
        ),
      )
      .first();
    if (existing) return;

    await ctx.db.insert("channelParticipants", {
      prismaId: crypto.randomUUID(),
      channelId: channelAppId,
      participantId: tenantId,
      participantType: "TENANT",
      joinedAt: Date.now(),
      leftAt: null,
    });
  },
});

export const removeFromPropertyChannelByLease = mutation({
  args: { leaseId: v.string(), tenantId: v.string() },
  handler: async (ctx, { leaseId, tenantId }) => {
    const lease = await leaseById(ctx, leaseId);
    if (!lease) return;
    const channel = await channelForProperty(ctx, lease.propertyId);
    if (!channel) return;

    const participants = await ctx.db
      .query("channelParticipants")
      .withIndex("by_channel", (q) => q.eq("channelId", appId(channel)))
      .filter((q) =>
        q.and(
          q.eq(q.field("participantId"), tenantId),
          q.eq(q.field("participantType"), "TENANT"),
        ),
      )
      .collect();
    await Promise.all(participants.map((p) => ctx.db.delete(p._id)));
  },
});
