"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getActiveSubscription } from "./db"
import Stripe from "stripe"

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
})

export async function getPaymentMethodAction() {
  try {
    // Get the current session
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session || !session.user.stripeCustomerId) {
      return { success: false, error: "No customer ID found" }
    }

    // Retrieve the customer's payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: session.user.stripeCustomerId,
      type: "card",
    })

    // Get the default payment method (first one in the list)
    const defaultPaymentMethod = paymentMethods.data[0]
    
    if (!defaultPaymentMethod) {
      return { success: false, error: "No payment method found" }
    }

    // Return the payment method details
    return { 
      success: true, 
      paymentMethod: {
        id: defaultPaymentMethod.id,
        brand: defaultPaymentMethod.card?.brand || "unknown",
        last4: defaultPaymentMethod.card?.last4 || "****",
        expMonth: defaultPaymentMethod.card?.exp_month || 12,
        expYear: defaultPaymentMethod.card?.exp_year || 25
      }
    }
  } catch (error) {
    console.error("Error retrieving payment method:", error)
    return { success: false, error: "Failed to retrieve payment method" }
  }
}

export async function createCustomerPortalSessionAction() {
  try {
    // Get the current session
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session || !session.user.stripeCustomerId) {
      return { success: false, error: "No customer ID found" }
    }

    // Create a Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: session.user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
    })

    // Return the URL to redirect to
    return { success: true, url: portalSession.url }
  } catch (error) {
    console.error("Error creating customer portal session:", error)
    return { success: false, error: "Failed to create customer portal session" }
  }
}

export async function checkSubscriptionStatusAction() {
  try {
    // Get the current session
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
      return { status: "none", plan: null }
    }

    // Check if user has a Stripe Customer ID
    if (!session.user.stripeCustomerId) {
      return { status: "none", plan: null }
    }

    // Use the singleton Prisma client
    
    try {
      // Get the active subscription using the service
      const subscription = await getActiveSubscription(session.user.stripeCustomerId);
      
      if (subscription) {
        return {
          status: "active",
          plan: subscription.plan,
          details: subscription
        };
      } else {
        return {
          status: "none",
          plan: null
        };
      }
    } catch (subscriptionError) {
      console.error('Error querying subscription from database:', subscriptionError);
      return { status: "none", plan: null }
    }
  } catch (error) {
    console.error("Error checking subscription status:", error)
    return { status: "none", plan: null }
  }
}
