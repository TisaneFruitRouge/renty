import { createAuthClient } from "better-auth/react"
import { convexClient } from "@convex-dev/better-auth/client/plugins"
import { stripeClient } from "@better-auth/stripe/client"

const useConvexAuth = process.env.NEXT_PUBLIC_AUTH_BACKEND !== "legacy";

// Create auth client with configuration to include all user fields
export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    user: {
        // Ensure these fields match the server-side configuration in auth.ts
        includeInSession: [
            'address',
            'city',
            'state',
            'country',
            'postalCode'
        ]
    },
    plugins: [
        ...(useConvexAuth ? [convexClient()] : []),
        stripeClient({
            subscription: true
        })
    ]
})

export const { signIn, signUp, useSession } = authClient
