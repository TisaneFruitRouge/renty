import { query, mutation } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { getLandlordById } from "./authUsers";

const leaseStatus = v.union(
  v.literal("ACTIVE"),
  v.literal("EXPIRED"),
  v.literal("TERMINATED"),
  v.literal("PENDING"),
);
const leaseType = v.union(
  v.literal("INDIVIDUAL"),
  v.literal("SHARED"),
  v.literal("COLOCATION"),
);
const terminationReason = v.union(
  v.literal("MUTUAL_AGREEMENT"),
  v.literal("TENANT_REQUEST"),
  v.literal("LANDLORD_REQUEST"),
  v.literal("NON_PAYMENT"),
  v.literal("BREACH_OF_CONTRACT"),
  v.literal("OTHER"),
);

function appId(doc: { prismaId?: string | null; _id: string }) {
  return doc.prismaId ?? doc._id;
}

function shape<T extends { _id: string; prismaId?: string | null }>(doc: T) {
  const { _creationTime, ...rest } = doc as T & { _creationTime: number };
  return { ...rest, id: appId(doc) };
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

async function tenantsWithAuth(ctx: QueryCtx, leaseAppId: string) {
  const tenants = await ctx.db
    .query("tenants")
    .withIndex("by_lease", (q) => q.eq("leaseId", leaseAppId))
    .collect();
  return Promise.all(
    tenants.map(async (tenant) => {
      const auth = await ctx.db
        .query("tenantAuths")
        .withIndex("by_tenant", (q) => q.eq("tenantId", appId(tenant)))
        .first();
      return { ...shape(tenant), auth: auth ? shape(auth) : null };
    }),
  );
}

async function plainTenants(ctx: QueryCtx, leaseAppId: string) {
  const tenants = await ctx.db
    .query("tenants")
    .withIndex("by_lease", (q) => q.eq("leaseId", leaseAppId))
    .collect();
  return tenants.map(shape);
}

async function propertyWithUser(ctx: QueryCtx, propertyId: string) {
  const property = await propertyByAppId(ctx, propertyId);
  if (!property) return null;
  return { ...shape(property), user: await getLandlordById(ctx, property.userId) };
}

type LeaseInput = {
  propertyId: string;
  startDate: number;
  endDate?: number | null;
  rentAmount: number;
  depositAmount?: number | null;
  charges?: number | null;
  leaseType: "INDIVIDUAL" | "SHARED" | "COLOCATION";
  isFurnished?: boolean;
  paymentFrequency?: string;
  currency?: string;
  status?: "ACTIVE" | "EXPIRED" | "TERMINATED" | "PENDING";
  notes?: string | null;
  autoGenerateReceipts?: boolean;
  receiptGenerationDate?: number | null;
  nextReceiptDate?: number | null;
  renewedFromLeaseId?: string | null;
};

async function insertLease(ctx: MutationCtx, data: LeaseInput) {
  const now = Date.now();
  const id = crypto.randomUUID();
  await ctx.db.insert("leases", {
    prismaId: id,
    propertyId: data.propertyId,
    startDate: data.startDate,
    endDate: data.endDate ?? null,
    rentAmount: data.rentAmount,
    depositAmount: data.depositAmount ?? null,
    charges: data.charges ?? 0,
    leaseType: data.leaseType,
    isFurnished: data.isFurnished ?? false,
    paymentFrequency: data.paymentFrequency ?? "monthly",
    currency: data.currency ?? "EUR",
    status: data.status ?? "ACTIVE",
    notes: data.notes ?? null,
    terminationReason: null,
    renewedFromLeaseId: data.renewedFromLeaseId ?? null,
    autoGenerateReceipts: data.autoGenerateReceipts ?? false,
    receiptGenerationDate: data.receiptGenerationDate ?? null,
    nextReceiptDate: data.nextReceiptDate ?? null,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

const leaseInputValidator = {
  propertyId: v.string(),
  startDate: v.number(),
  endDate: v.optional(v.union(v.null(), v.number())),
  rentAmount: v.number(),
  depositAmount: v.optional(v.union(v.null(), v.number())),
  charges: v.optional(v.union(v.null(), v.number())),
  leaseType,
  isFurnished: v.optional(v.boolean()),
  paymentFrequency: v.optional(v.string()),
  currency: v.optional(v.string()),
  status: v.optional(leaseStatus),
  notes: v.optional(v.union(v.null(), v.string())),
  autoGenerateReceipts: v.optional(v.boolean()),
  receiptGenerationDate: v.optional(v.union(v.null(), v.number())),
  nextReceiptDate: v.optional(v.union(v.null(), v.number())),
  renewedFromLeaseId: v.optional(v.union(v.null(), v.string())),
};

// ---- Queries ----

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const lease = await leaseById(ctx, id);
    if (!lease) return null;
    return {
      ...shape(lease),
      property: await propertyByAppId(ctx, lease.propertyId).then((p) => (p ? shape(p) : null)),
      tenants: await tenantsWithAuth(ctx, appId(lease)),
    };
  },
});

export const listByProperty = query({
  args: { propertyId: v.string() },
  handler: async (ctx, { propertyId }) => {
    const leases = await ctx.db
      .query("leases")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
    leases.sort((a, b) => b.createdAt - a.createdAt);
    return Promise.all(
      leases.map(async (lease) => ({
        ...shape(lease),
        tenants: await tenantsWithAuth(ctx, appId(lease)),
      })),
    );
  },
});

export const listActiveByProperty = query({
  args: { propertyId: v.string() },
  handler: async (ctx, { propertyId }) => {
    const leases = (
      await ctx.db
        .query("leases")
        .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
        .collect()
    ).filter((l) => l.status === "ACTIVE");
    leases.sort((a, b) => b.startDate - a.startDate);
    return Promise.all(
      leases.map(async (lease) => ({
        ...shape(lease),
        tenants: await tenantsWithAuth(ctx, appId(lease)),
      })),
    );
  },
});

async function leasesForUser(ctx: QueryCtx, userId: string) {
  const properties = await ctx.db
    .query("properties")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const propertyById = new Map(properties.map((p) => [appId(p), p]));
  const leases: Doc<"leases">[] = [];
  for (const property of properties) {
    const propertyLeases = await ctx.db
      .query("leases")
      .withIndex("by_property", (q) => q.eq("propertyId", appId(property)))
      .collect();
    leases.push(...propertyLeases);
  }
  return { leases, propertyById };
}

export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const { leases, propertyById } = await leasesForUser(ctx, userId);
    leases.sort((a, b) => b.createdAt - a.createdAt);
    return Promise.all(leases.map(async (lease) => {
      const property = propertyById.get(lease.propertyId);
      return {
        ...shape(lease),
        property: property ? shape(property) : null,
        tenants: await tenantsWithAuth(ctx, appId(lease)),
      };
    }));
  },
});

export const listActiveForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const { leases, propertyById } = await leasesForUser(ctx, userId);
    const active = leases.filter((l) => l.status === "ACTIVE");
    active.sort((a, b) => b.startDate - a.startDate);
    return Promise.all(
      active.map(async (lease) => {
        const property = propertyById.get(lease.propertyId);
        return {
          ...shape(lease),
          property: property ? shape(property) : null,
          tenants: await tenantsWithAuth(ctx, appId(lease)),
        };
      }),
    );
  },
});

export const getWithTenants = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const lease = await leaseById(ctx, id);
    if (!lease) return null;
    return {
      ...shape(lease),
      property: await propertyWithUser(ctx, lease.propertyId),
      tenants: await tenantsWithAuth(ctx, appId(lease)),
    };
  },
});

export const getWithReceiptSettings = getWithTenants;

export const getExpired = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const leases = (
      await ctx.db
        .query("leases")
        .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
        .collect()
    ).filter((l) => l.endDate != null && l.endDate < now);
    return Promise.all(
      leases.map(async (lease) => ({
        ...shape(lease),
        property: await propertyByAppId(ctx, lease.propertyId).then((p) => (p ? shape(p) : null)),
        tenants: await plainTenants(ctx, appId(lease)),
      })),
    );
  },
});

export const listByStatus = query({
  args: { status: leaseStatus },
  handler: async (ctx, { status }) => {
    const leases = await ctx.db
      .query("leases")
      .withIndex("by_status", (q) => q.eq("status", status))
      .collect();
    leases.sort((a, b) => b.createdAt - a.createdAt);
    return Promise.all(
      leases.map(async (lease) => ({
        ...shape(lease),
        property: await propertyByAppId(ctx, lease.propertyId).then((p) => (p ? shape(p) : null)),
        tenants: await tenantsWithAuth(ctx, appId(lease)),
      })),
    );
  },
});

export const findForUser = query({
  args: { id: v.string(), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const lease = await leaseById(ctx, id);
    if (!lease) return null;
    const property = await propertyByAppId(ctx, lease.propertyId);
    if (!property || property.userId !== userId) return null;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_property", (q) => q.eq("propertyId", appId(property)))
      .collect();
    return {
      ...shape(lease),
      property: { ...shape(property), documents: documents.map(shape) },
      tenants: await tenantsWithAuth(ctx, appId(lease)),
    };
  },
});

export const countForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const { leases } = await leasesForUser(ctx, userId);
    return leases.length;
  },
});

export const requiringReceiptGeneration = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const leases = (
      await ctx.db
        .query("leases")
        .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
        .collect()
    ).filter(
      (l) => l.autoGenerateReceipts && l.nextReceiptDate != null && l.nextReceiptDate <= now,
    );

    const result = await Promise.all(
      leases.map(async (lease) => {
        const tenants = await tenantsWithAuth(ctx, appId(lease));
        if (tenants.length === 0) return null;
        return {
          ...shape(lease),
          property: await propertyWithUser(ctx, lease.propertyId),
          tenants,
        };
      }),
    );
    return result.filter((entry) => entry !== null);
  },
});

export const countExpiringForUser = query({
  args: { userId: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, { userId, days }) => {
    const now = Date.now();
    const future = now + (days ?? 30) * 24 * 60 * 60 * 1000;
    const { leases } = await leasesForUser(ctx, userId);
    return leases.filter(
      (l) =>
        l.status === "ACTIVE" &&
        l.endDate != null &&
        l.endDate >= now &&
        l.endDate <= future,
    ).length;
  },
});

// ---- Mutations ----

export const create = mutation({
  args: leaseInputValidator,
  handler: async (ctx, args) => {
    const id = await insertLease(ctx, args);
    const lease = await leaseById(ctx, id);
    return {
      ...shape(lease!),
      property: await propertyByAppId(ctx, lease!.propertyId).then((p) => (p ? shape(p) : null)),
      tenants: await plainTenants(ctx, id),
    };
  },
});

export const terminate = mutation({
  args: {
    id: v.string(),
    endDate: v.number(),
    terminationReason,
    notes: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, args) => {
    const lease = await leaseById(ctx, args.id);
    if (!lease) throw new Error("lease not found");
    const patch: Record<string, unknown> = {
      status: "TERMINATED",
      endDate: args.endDate,
      terminationReason: args.terminationReason,
      autoGenerateReceipts: false,
      updatedAt: Date.now(),
    };
    if (args.notes !== undefined) patch.notes = args.notes;
    await ctx.db.patch(lease._id, patch);
    const updated = await ctx.db.get(lease._id);
    return {
      ...shape(updated!),
      property: await propertyByAppId(ctx, updated!.propertyId).then((p) => (p ? shape(p) : null)),
      tenants: await plainTenants(ctx, appId(updated!)),
    };
  },
});

export const renew = mutation({
  args: { oldLeaseId: v.string(), newLease: v.object(leaseInputValidator) },
  handler: async (ctx, { oldLeaseId, newLease }) => {
    const newId = await insertLease(ctx, {
      ...newLease,
      status: "ACTIVE",
      autoGenerateReceipts: false,
      renewedFromLeaseId: oldLeaseId,
    });

    const oldLease = await leaseById(ctx, oldLeaseId);
    if (oldLease) {
      await ctx.db.patch(oldLease._id, { status: "EXPIRED", updatedAt: Date.now() });
      const tenants = await ctx.db
        .query("tenants")
        .withIndex("by_lease", (q) => q.eq("leaseId", oldLeaseId))
        .collect();
      await Promise.all(
        tenants.map((t) => ctx.db.patch(t._id, { leaseId: newId, updatedAt: Date.now() })),
      );
    }

    const created = await leaseById(ctx, newId);
    return {
      newLease: {
        ...shape(created!),
        property: await propertyByAppId(ctx, created!.propertyId).then((p) => (p ? shape(p) : null)),
        tenants: await plainTenants(ctx, newId),
      },
    };
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.union(v.null(), v.number())),
    rentAmount: v.optional(v.number()),
    depositAmount: v.optional(v.union(v.null(), v.number())),
    charges: v.optional(v.union(v.null(), v.number())),
    leaseType: v.optional(leaseType),
    isFurnished: v.optional(v.boolean()),
    paymentFrequency: v.optional(v.string()),
    currency: v.optional(v.string()),
    status: v.optional(leaseStatus),
    notes: v.optional(v.union(v.null(), v.string())),
    autoGenerateReceipts: v.optional(v.boolean()),
    receiptGenerationDate: v.optional(v.union(v.null(), v.number())),
    nextReceiptDate: v.optional(v.union(v.null(), v.number())),
  },
  handler: async (ctx, { id, ...fields }) => {
    const lease = await leaseById(ctx, id);
    if (!lease) throw new Error("lease not found");
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(lease._id, patch);
    const updated = await ctx.db.get(lease._id);
    return {
      ...shape(updated!),
      property: await propertyByAppId(ctx, updated!.propertyId).then((p) => (p ? shape(p) : null)),
      tenants: await tenantsWithAuth(ctx, appId(updated!)),
    };
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const lease = await leaseById(ctx, id);
    if (!lease) throw new Error("lease not found");
    const shaped = shape(lease);
    await ctx.db.delete(lease._id);
    return shaped;
  },
});

export const updateStatus = mutation({
  args: { id: v.string(), status: leaseStatus },
  handler: async (ctx, { id, status }) => {
    const lease = await leaseById(ctx, id);
    if (!lease) throw new Error("lease not found");
    await ctx.db.patch(lease._id, { status, updatedAt: Date.now() });
    return shape((await ctx.db.get(lease._id))!);
  },
});

export const updateRentReceiptSettings = mutation({
  args: {
    id: v.string(),
    autoGenerateReceipts: v.boolean(),
    receiptGenerationDate: v.optional(v.union(v.null(), v.number())),
    nextReceiptDate: v.optional(v.union(v.null(), v.number())),
  },
  handler: async (ctx, { id, autoGenerateReceipts, receiptGenerationDate, nextReceiptDate }) => {
    const lease = await leaseById(ctx, id);
    if (!lease) throw new Error("lease not found");
    await ctx.db.patch(lease._id, {
      autoGenerateReceipts,
      receiptGenerationDate: receiptGenerationDate ?? null,
      nextReceiptDate: nextReceiptDate ?? null,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get(lease._id);
    return {
      ...shape(updated!),
      property: await propertyByAppId(ctx, updated!.propertyId).then((p) => (p ? shape(p) : null)),
      tenants: await plainTenants(ctx, appId(updated!)),
    };
  },
});

export const updateNextReceiptDate = mutation({
  args: { id: v.string(), nextReceiptDate: v.number() },
  handler: async (ctx, { id, nextReceiptDate }) => {
    const lease = await leaseById(ctx, id);
    if (!lease) throw new Error("lease not found");
    await ctx.db.patch(lease._id, { nextReceiptDate, updatedAt: Date.now() });
    return shape((await ctx.db.get(lease._id))!);
  },
});
