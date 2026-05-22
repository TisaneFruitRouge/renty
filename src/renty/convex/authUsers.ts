import { components } from "./_generated/api";
import type { QueryCtx } from "./_generated/server";

/**
 * Resolve a landlord (Better Auth user) by the app-level user id. Users live in
 * the Better Auth component, so we query its adapter rather than a local table.
 */
export async function getLandlordById(ctx: QueryCtx, userId: string) {
  const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [{ field: "userId", value: userId, operator: "eq" }],
  });
  if (!user) return null;
  return { ...user, id: (user as { userId?: string; _id: string }).userId ?? user._id };
}
