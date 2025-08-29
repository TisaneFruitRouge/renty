import { prisma } from "@/prisma/db";

/**
 * Check if a user has an active subscription
 * @param stripeCustomerId The Stripe customer ID of the user
 * @returns The active subscription if found, null otherwise
 */
export async function getActiveSubscription(stripeCustomerId: string | null | undefined) {
  if (!stripeCustomerId) return null;
  
  return prisma.subscription.findFirst({
    where: {
      stripeCustomerId,
      status: 'active'
    },
    orderBy: {
      periodEnd: 'desc'
    }
  });
}

/**
 * Get all subscriptions for a user
 * @param stripeCustomerId The Stripe customer ID of the user
 * @returns Array of all subscriptions for the user
 */
export async function getUserSubscriptions(stripeCustomerId: string | null | undefined) {
  if (!stripeCustomerId) return [];
  
  return prisma.subscription.findMany({
    where: {
      stripeCustomerId
    },
    orderBy: {
      periodEnd: 'desc'
    }
  });
}
