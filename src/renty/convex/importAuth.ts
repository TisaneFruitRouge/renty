import { mutation } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";

const nullableString = v.optional(v.union(v.null(), v.string()));
const nullableNumber = v.optional(v.union(v.null(), v.number()));

export const importUsers = mutation({
  args: {
    users: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        email: v.string(),
        emailVerified: v.boolean(),
        image: nullableString,
        createdAt: v.number(),
        updatedAt: v.number(),
        stripeCustomerId: nullableString,
        address: nullableString,
        city: nullableString,
        state: nullableString,
        country: nullableString,
        postalCode: nullableString,
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.runMutation(
      components.betterAuth.importFromPrisma.importUsers,
      args,
    );
  },
});

export const importCredentialAccounts = mutation({
  args: {
    accounts: v.array(
      v.object({
        userId: v.string(),
        accountId: v.string(),
        providerId: v.string(),
        password: nullableString,
        accessToken: nullableString,
        refreshToken: nullableString,
        idToken: nullableString,
        accessTokenExpiresAt: nullableNumber,
        refreshTokenExpiresAt: nullableNumber,
        scope: nullableString,
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.runMutation(
      components.betterAuth.importFromPrisma.importCredentialAccounts,
      args,
    );
  },
});
