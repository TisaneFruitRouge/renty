import { stripe } from "@better-auth/stripe";
import { convex } from "@convex-dev/better-auth/plugins";
import { crossDomain } from "@convex-dev/better-auth/plugins";
import type { BetterAuthOptions } from "better-auth/minimal";
import Stripe from "stripe";
import authConfig from "./auth.config";

const siteUrl =
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.BETTER_AUTH_URL ??
  "http://localhost:3000";

const frontendUrl =
  process.env.FRONTEND_SITE_URL ??
  process.env.VITE_APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  siteUrl;

const trustedOrigins = Array.from(
  new Set(
    [
      siteUrl,
      frontendUrl,
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VITE_APP_URL,
      process.env.VITE_AUTH_ORIGIN,
      process.env.TRUSTED_AUTH_ORIGINS,
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ]
      .flatMap((origin) => origin?.split(",") ?? [])
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
);

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_convex_schema_generation_placeholder",
  {
    apiVersion: "2026-05-27.dahlia",
  },
);

export function buildAuthOptions(
  database: BetterAuthOptions["database"],
): BetterAuthOptions {
  return {
    baseURL: siteUrl,
    trustedOrigins,
    database,
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      stripe({
        stripeClient: stripeClient as any,
        stripeWebhookSecret:
          process.env.STRIPE_WEBHOOK_SECRET ??
          "whsec_convex_schema_generation_placeholder",
        createCustomerOnSignUp: true,
        subscription: {
          enabled: true,
          plans: [
            {
              name: "basic",
              priceId:
                process.env.STRIPE_BASIC_PRICE_ID ??
                "price_convex_schema_generation_basic",
              annualDiscountPriceId:
                process.env.STRIPE_BASIC_ANNUAL_DISCOUNT_PRICE_ID ??
                "price_convex_schema_generation_basic_annual",
              limits: {
                properties: 2,
              },
            },
            {
              name: "pro",
              priceId:
                process.env.STRIPE_PRO_PRICE_ID ??
                "price_convex_schema_generation_pro",
              annualDiscountPriceId:
                process.env.STRIPE_PRO_ANNUAL_DISCOUNT_PRICE_ID ??
                "price_convex_schema_generation_pro_annual",
              limits: {
                properties: 1000,
              },
            },
          ],
        },
      }),
      crossDomain({ siteUrl: frontendUrl }),
      convex({ authConfig }),
    ],
    user: {
      additionalFields: {
        address: { type: "string", required: false },
        city: { type: "string", required: false },
        state: { type: "string", required: false },
        country: { type: "string", required: false },
        postalCode: { type: "string", required: false },
        stripeCustomerId: { type: "string", required: false },
      },
    },
  };
}
