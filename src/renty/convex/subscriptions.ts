import { query } from "./_generated/server";
import { v } from "convex/values";

function appId(doc: { prismaId?: string | null; _id: string }) {
  return doc.prismaId ?? doc._id;
}

function shape<T extends { _id: string; prismaId?: string | null }>(doc: T) {
  const { _creationTime, ...rest } = doc as T & { _creationTime: number };
  return { ...rest, id: appId(doc) };
}

export const activeForCustomer = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, { stripeCustomerId }) => {
    const subscriptions = (
      await ctx.db
        .query("subscriptions")
        .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", stripeCustomerId))
        .collect()
    ).filter((s) => s.status === "active");
    subscriptions.sort((a, b) => (b.periodEnd ?? 0) - (a.periodEnd ?? 0));
    const active = subscriptions[0];
    return active ? shape(active) : null;
  },
});

export const listForCustomer = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, { stripeCustomerId }) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", stripeCustomerId))
      .collect();
    subscriptions.sort((a, b) => (b.periodEnd ?? 0) - (a.periodEnd ?? 0));
    return subscriptions.map(shape);
  },
});
