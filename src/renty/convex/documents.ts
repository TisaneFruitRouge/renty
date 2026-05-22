import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const documentCategory = v.union(
  v.literal("LEASE"),
  v.literal("INVENTORY"),
  v.literal("INSURANCE"),
  v.literal("MAINTENANCE"),
  v.literal("PAYMENT"),
  v.literal("CORRESPONDENCE"),
  v.literal("LEGAL"),
  v.literal("UTILITY"),
  v.literal("OTHER"),
);

function appId(doc: { prismaId?: string | null; _id: string }) {
  return doc.prismaId ?? doc._id;
}

function shape<T extends { _id: string; prismaId?: string | null }>(doc: T) {
  const { _creationTime, ...rest } = doc as T & { _creationTime: number };
  return { ...rest, id: appId(doc) };
}

async function documentById(ctx: QueryCtx, id: string) {
  const byPrisma = await ctx.db
    .query("documents")
    .withIndex("by_prisma_id", (q) => q.eq("prismaId", id))
    .first();
  if (byPrisma) return byPrisma;
  const convexId = ctx.db.normalizeId("documents", id);
  return convexId ? await ctx.db.get(convexId) : null;
}

export const listForProperty = query({
  args: { propertyId: v.string() },
  handler: async (ctx, { propertyId }) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .collect();
    documents.sort((a, b) => b.uploadedAt - a.uploadedAt);
    return documents.map(shape);
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const document = await documentById(ctx, id);
    return document ? shape(document) : null;
  },
});

export const create = mutation({
  args: {
    propertyId: v.string(),
    name: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    category: documentCategory,
    sharedWithTenant: v.boolean(),
    description: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await ctx.db.insert("documents", {
      prismaId: id,
      propertyId: args.propertyId,
      name: args.name,
      description: args.description ?? null,
      fileUrl: args.fileUrl,
      fileType: args.fileType,
      fileSize: args.fileSize,
      category: args.category,
      sharedWithTenant: args.sharedWithTenant,
      uploadedAt: now,
      updatedAt: now,
    });
    return shape((await documentById(ctx, id))!);
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.null(), v.string())),
    category: v.optional(documentCategory),
    sharedWithTenant: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const document = await documentById(ctx, id);
    if (!document) throw new Error("document not found");
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(document._id, patch);
    return shape((await ctx.db.get(document._id))!);
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const document = await documentById(ctx, id);
    if (!document) throw new Error("document not found");
    const shaped = shape(document);
    await ctx.db.delete(document._id);
    return shaped;
  },
});
