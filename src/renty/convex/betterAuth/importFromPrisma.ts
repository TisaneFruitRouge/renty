import { mutation } from "./_generated/server";
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
    const mappings: Array<{ legacyId: string; authId: string }> = [];

    for (const user of args.users) {
      const existing = await ctx.db
        .query("user")
        .withIndex("userId", (q) => q.eq("userId", user.id))
        .first();

      const data = {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stripeCustomerId: user.stripeCustomerId ?? null,
        userId: user.id,
        address: user.address ?? null,
        city: user.city ?? null,
        state: user.state ?? null,
        country: user.country ?? null,
        postalCode: user.postalCode ?? null,
      };

      if (existing) {
        await ctx.db.patch(existing._id, data);
        mappings.push({ legacyId: user.id, authId: existing._id });
        continue;
      }

      const authId = await ctx.db.insert("user", data);
      mappings.push({ legacyId: user.id, authId });
    }

    return mappings;
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
    let imported = 0;

    for (const account of args.accounts) {
      const user = await ctx.db
        .query("user")
        .withIndex("userId", (q) => q.eq("userId", account.userId))
        .first();

      if (!user) {
        throw new Error(`Missing imported auth user for ${account.userId}`);
      }

      const existing = await ctx.db
        .query("account")
        .withIndex("accountId_providerId", (q) =>
          q.eq("accountId", account.accountId).eq("providerId", account.providerId),
        )
        .first();

      const data = {
        accountId: account.accountId,
        providerId: account.providerId,
        userId: user._id,
        accessToken: account.accessToken ?? null,
        refreshToken: account.refreshToken ?? null,
        idToken: account.idToken ?? null,
        accessTokenExpiresAt: account.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: account.refreshTokenExpiresAt ?? null,
        scope: account.scope ?? null,
        password: account.password ?? null,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      };

      if (existing) {
        await ctx.db.patch(existing._id, data);
      } else {
        await ctx.db.insert("account", data);
      }

      imported += 1;
    }

    return { imported };
  },
});
