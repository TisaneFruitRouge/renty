"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { components } from "./_generated/api";

type AuthUser = {
  _id: string;
  userId?: string | null;
  stripeCustomerId?: string | null;
};

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_convex_schema_generation_placeholder",
  {
    apiVersion: "2026-05-27.dahlia",
  },
);

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

export const getPaymentMethod = action({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await findAuthUser(ctx, userId);
    if (!user?.stripeCustomerId) {
      return { success: false, error: "No customer ID found" };
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });
    const defaultPaymentMethod = paymentMethods.data[0];

    if (!defaultPaymentMethod) {
      return { success: false, error: "No payment method found" };
    }

    return {
      success: true,
      paymentMethod: {
        id: defaultPaymentMethod.id,
        brand: defaultPaymentMethod.card?.brand || "unknown",
        last4: defaultPaymentMethod.card?.last4 || "****",
        expMonth: defaultPaymentMethod.card?.exp_month || 12,
        expYear: defaultPaymentMethod.card?.exp_year || 25,
      },
    };
  },
});

export const createCustomerPortalSession = action({
  args: {
    userId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, { userId, returnUrl }) => {
    const user = await findAuthUser(ctx, userId);
    if (!user?.stripeCustomerId) {
      return { success: false, error: "No customer ID found" };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { success: true, url: portalSession.url };
  },
});
