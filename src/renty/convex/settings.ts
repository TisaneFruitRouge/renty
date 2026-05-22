import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

type AuthUser = {
  _id: string;
  userId?: string | null;
  updatedAt?: number;
};

async function findAuthUser(ctx: any, userId: string): Promise<AuthUser | null> {
  const byLegacyId = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [{ field: "userId", value: userId, operator: "eq" }],
  });
  if (byLegacyId) return byLegacyId as AuthUser;

  const byAuthId = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [{ field: "_id", value: userId, operator: "eq" }],
  });
  return (byAuthId as AuthUser | null) ?? null;
}

function shapeUser(user: any) {
  return { ...user, id: user.userId ?? user._id };
}

function shapeSession(session: any) {
  return { ...session, id: session._id };
}

export const updateUser = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    address: v.optional(v.union(v.null(), v.string())),
    city: v.optional(v.union(v.null(), v.string())),
    state: v.optional(v.union(v.null(), v.string())),
    country: v.optional(v.union(v.null(), v.string())),
    postalCode: v.optional(v.union(v.null(), v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await findAuthUser(ctx, args.id);
    if (!existing) throw new Error("User not found");

    const updated = await ctx.runMutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: "user",
        where: [{ field: "_id", value: existing._id }],
        update: {
          name: args.name,
          email: args.email,
          image: args.image ?? "",
          address: args.address ?? null,
          city: args.city ?? null,
          state: args.state ?? null,
          country: args.country ?? null,
          postalCode: args.postalCode ?? null,
          updatedAt: Date.now(),
        },
      },
    });

    return shapeUser(updated);
  },
});

export const listSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await findAuthUser(ctx, userId);
    if (!user) return [];

    const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "session",
      where: [{ field: "userId", value: user._id, operator: "eq" }],
      paginationOpts: { cursor: null, numItems: 200 },
    });

    const sessions = (result.page ?? []).map(shapeSession);
    sessions.sort((a: any, b: any) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    return sessions;
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.string(), userId: v.string() },
  handler: async (ctx, { sessionId, userId }) => {
    const user = await findAuthUser(ctx, userId);
    if (!user) throw new Error("User not found");

    const deleted = await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: "session",
        where: [
          { field: "_id", value: sessionId },
          { field: "userId", value: user._id },
        ],
      },
    });

    if (!deleted) throw new Error("Session not found");
    return shapeSession(deleted);
  },
});
