import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { reviveDates } from "@/lib/convex-map";
import type { subscription } from "@/lib/types";

/**
 * Check if a user has an active subscription
 * @param stripeCustomerId The Stripe customer ID of the user
 * @returns The active subscription if found, null otherwise
 */
export async function getActiveSubscription(stripeCustomerId: string | null | undefined) {
  if (!stripeCustomerId) return null;
  const active = await getConvexClient().query(api.subscriptions.activeForCustomer, {
    stripeCustomerId,
  });
  return reviveDates(active) as unknown as subscription | null;
}

/**
 * Get all subscriptions for a user
 * @param stripeCustomerId The Stripe customer ID of the user
 * @returns Array of all subscriptions for the user
 */
export async function getUserSubscriptions(stripeCustomerId: string | null | undefined) {
  if (!stripeCustomerId) return [];
  const subscriptions = await getConvexClient().query(api.subscriptions.listForCustomer, {
    stripeCustomerId,
  });
  return reviveDates(subscriptions) as unknown as subscription[];
}
