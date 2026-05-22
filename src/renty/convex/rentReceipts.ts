import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { getLandlordById } from "./authUsers";

const rentReceiptStatus = v.union(
  v.literal("PENDING"),
  v.literal("PAID"),
  v.literal("LATE"),
  v.literal("UNPAID"),
  v.literal("CANCELLED"),
  v.literal("DRAFT"),
);

function appId(doc: { prismaId?: string | null; _id: string }) {
  return doc.prismaId ?? doc._id;
}

function shape<T extends { _id: string; prismaId?: string | null }>(doc: T) {
  const { _creationTime, ...rest } = doc as T & { _creationTime: number };
  return { ...rest, id: appId(doc) };
}

async function receiptById(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("rentReceipts")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("rentReceipts", id);
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

async function tenantByAppId(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("tenants")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("tenants", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

async function leaseByAppId(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("leases")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("leases", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

async function propertyShaped(ctx: QueryCtx, id: string) {
  const property = await propertyByAppId(ctx, id);
  return property ? shape(property) : null;
}

async function tenantShaped(ctx: QueryCtx, id: string) {
  const tenant = await tenantByAppId(ctx, id);
  return tenant ? shape(tenant) : null;
}

async function fullReceipt(ctx: QueryCtx, receipt: Awaited<ReturnType<typeof receiptById>>) {
  if (!receipt) return null;
  const property = await propertyByAppId(ctx, receipt.propertyId);
  const propertyWithUser = property
    ? { ...shape(property), user: await getLandlordById(ctx, property.userId) }
    : null;

  const leaseDoc = receipt.leaseId ? await leaseByAppId(ctx, receipt.leaseId) : null;
  const lease = leaseDoc
    ? {
        ...shape(leaseDoc),
        tenants: (
          await ctx.db
            .query("tenants")
            .withIndex("by_lease", (q) => q.eq("leaseId", appId(leaseDoc)))
            .collect()
        ).map(shape),
      }
    : null;

  return {
    ...shape(receipt),
    property: propertyWithUser,
    tenant: await tenantShaped(ctx, receipt.tenantId),
    lease,
  };
}

// ---- Queries ----

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => fullReceipt(ctx, await receiptById(ctx, id)),
});

async function receiptsForUser(ctx: QueryCtx, userId: string) {
  const properties = await ctx.db
    .query("properties")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const receipts: Doc<"rentReceipts">[] = [];
  for (const property of properties) {
    const propertyReceipts = await ctx.db
      .query("rentReceipts")
      .withIndex("by_property", (q) => q.eq("propertyId", appId(property)))
      .collect();
    receipts.push(...propertyReceipts);
  }
  return receipts;
}

export const listForUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit }) => {
    const receipts = await receiptsForUser(ctx, userId);
    receipts.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const sliced = limit !== undefined ? receipts.slice(0, limit) : receipts;
    return Promise.all(
      sliced.map(async (receipt) => ({
        ...shape(receipt),
        property: await propertyShaped(ctx, receipt.propertyId),
        tenant: await tenantShaped(ctx, receipt.tenantId),
      })),
    );
  },
});

export const countWaitingForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const receipts = await receiptsForUser(ctx, userId);
    return receipts.filter((r) => r.status === "PENDING" || r.status === "LATE").length;
  },
});

export const listByProperty = query({
  args: { propertyId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { propertyId, limit }) => {
    const receipts = await ctx.db
      .query("rentReceipts")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
    receipts.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    const sliced = limit !== undefined ? receipts.slice(0, limit) : receipts;
    return Promise.all(
      sliced.map(async (receipt) => ({
        ...shape(receipt),
        property: await propertyShaped(ctx, receipt.propertyId),
        tenant: await tenantShaped(ctx, receipt.tenantId),
      })),
    );
  },
});

export const pendingOlderThan = query({
  args: { cutoff: v.number() },
  handler: async (ctx, { cutoff }) => {
    const receipts = (
      await ctx.db
        .query("rentReceipts")
        .withIndex("by_status", (q) => q.eq("status", "PENDING"))
        .collect()
    ).filter((r) => (r.createdAt ?? 0) <= cutoff);
    return Promise.all(receipts.map((receipt) => fullReceipt(ctx, receipt)));
  },
});

// ---- Mutations ----

export const create = mutation({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    baseRent: v.number(),
    charges: v.number(),
    paymentFrequency: v.string(),
    propertyId: v.string(),
    tenantId: v.string(),
    leaseId: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await ctx.db.insert("rentReceipts", {
      prismaId: id,
      startDate: args.startDate,
      endDate: args.endDate,
      baseRent: args.baseRent,
      charges: args.charges,
      paymentFrequency: args.paymentFrequency,
      propertyId: args.propertyId,
      tenantId: args.tenantId,
      leaseId: args.leaseId ?? null,
      blobUrl: null,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });
    return shape((await receiptById(ctx, id))!);
  },
});

export const createShared = mutation({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    baseRent: v.number(),
    charges: v.number(),
    paymentFrequency: v.string(),
    propertyId: v.string(),
    tenantIds: v.array(v.string()),
    leaseId: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, args) => {
    if (args.tenantIds.length === 0) {
      throw new Error("At least one tenant is required for shared receipt");
    }
    const now = Date.now();
    const id = crypto.randomUUID();
    await ctx.db.insert("rentReceipts", {
      prismaId: id,
      startDate: args.startDate,
      endDate: args.endDate,
      baseRent: args.baseRent,
      charges: args.charges,
      paymentFrequency: args.paymentFrequency,
      propertyId: args.propertyId,
      tenantId: args.tenantIds[0], // primary tenant on a shared receipt
      leaseId: args.leaseId ?? null,
      blobUrl: null,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });
    return shape((await receiptById(ctx, id))!);
  },
});

export const addBlobUrl = mutation({
  args: { id: v.string(), blobUrl: v.string() },
  handler: async (ctx, { id, blobUrl }) => {
    const receipt = await receiptById(ctx, id);
    if (!receipt) throw new Error("receipt not found");
    await ctx.db.patch(receipt._id, { blobUrl, updatedAt: Date.now() });
    return shape((await ctx.db.get(receipt._id))!);
  },
});

export const updateStatus = mutation({
  args: { id: v.string(), status: rentReceiptStatus },
  handler: async (ctx, { id, status }) => {
    const receipt = await receiptById(ctx, id);
    if (!receipt) throw new Error("receipt not found");
    await ctx.db.patch(receipt._id, { status, updatedAt: Date.now() });
    return shape((await ctx.db.get(receipt._id))!);
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const receipt = await receiptById(ctx, id);
    if (!receipt) throw new Error("receipt not found");
    const shaped = shape(receipt);
    await ctx.db.delete(receipt._id);
    return shaped;
  },
});
