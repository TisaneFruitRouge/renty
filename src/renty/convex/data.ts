import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const tableName = v.union(
  v.literal("properties"),
  v.literal("tenants"),
  v.literal("tenantAuths"),
  v.literal("leases"),
  v.literal("rentReceipts"),
  v.literal("channels"),
  v.literal("channelParticipants"),
  v.literal("messages"),
  v.literal("documents"),
  v.literal("subscriptions"),
);

export const list = query({
  args: { table: tableName },
  handler: async (ctx, args) => {
    return await (ctx.db.query(args.table as any) as any).collect();
  },
});

export const insert = mutation({
  args: { table: tableName, data: v.any() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert(args.table as any, normalizeDates(args.data));
    return await ctx.db.get(id);
  },
});

export const upsertMany = mutation({
  args: { table: tableName, rows: v.array(v.any()) },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;

    for (const row of args.rows) {
      const data = normalizeDates(row);
      const existing = data.prismaId
        ? await (ctx.db.query(args.table as any) as any)
            .filter((q: any) => q.eq(q.field("prismaId"), data.prismaId))
            .first()
        : null;

      if (existing) {
        await ctx.db.patch(existing._id, data);
        updated += 1;
      } else {
        await ctx.db.insert(args.table as any, data);
        inserted += 1;
      }
    }

    return { inserted, updated };
  },
});

export const patch = mutation({
  args: { table: tableName, id: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id as any, normalizeDates(args.data));
    return await ctx.db.get(args.id as any);
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id as any);
    if (!doc) return null;
    await ctx.db.delete(args.id as any);
    return doc;
  },
});

export const removeMany = mutation({
  args: { table: tableName, ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    let count = 0;
    for (const id of args.ids) {
      const doc = await ctx.db.get(id as any);
      if (!doc) continue;
      await ctx.db.delete(id as any);
      count += 1;
    }
    return { count };
  },
});

function normalizeDates(value: any): any {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeDates);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, normalizeDates(entry)]),
    );
  }

  return value;
}
