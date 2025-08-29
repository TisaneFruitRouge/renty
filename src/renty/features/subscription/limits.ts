import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { authPlans } from "./plans";
import { getActiveSubscription } from "./db";

// Define the resource types that can be limited
export type LimitableResource = 'properties' | 'tenants' | 'receipts';

// Error class for subscription limit errors
export class SubscriptionLimitError extends Error {
  constructor(resource: LimitableResource, limit: number) {
    super(`You've reached your ${resource} limit (${limit}). Please upgrade your plan to add more.`);
    this.name = "SubscriptionLimitError";
  }
}

// Get the current user's plan limits
export async function getUserPlanLimits() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  
  // Get the user's Stripe customer ID from the session
  const stripeCustomerId = session.user.stripeCustomerId;
  
  // Get the active subscription from the database
  const activeSubscription = await getActiveSubscription(stripeCustomerId);
  
  // Get plan name from active subscription or default to "basic"
  const planName = activeSubscription?.plan || "basic";
  
  // Find the plan limits from our hardcoded plans
  const plan = authPlans.find(p => p.name === planName);
  
  return {
    userId: session.user.id,
    planName,
    limits: plan?.limits || { properties: 2 } // Default to basic plan limits
  };
}

// Check if a user has reached their limit for a specific resource
export async function checkResourceLimit(
  resource: LimitableResource, 
  currentCount: number
): Promise<boolean> {
  const { limits } = await getUserPlanLimits();
  
  // If the resource isn't limited or the limit is undefined, allow it
  if (!limits[resource]) return true;
  
  // Check if adding one more would exceed the limit
  return currentCount < limits[resource];
}

// Enforce a limit check and throw an error if the limit is reached
export async function enforceResourceLimit(
  resource: LimitableResource, 
  currentCount: number
): Promise<void> {
  const { limits } = await getUserPlanLimits();
  
  // If the resource isn't limited, allow it
  if (!limits[resource]) return;
  
  // Check if adding one more would exceed the limit
  if (currentCount >= limits[resource]) {
    throw new SubscriptionLimitError(resource, limits[resource]);
  }
}
