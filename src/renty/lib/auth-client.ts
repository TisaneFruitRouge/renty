import { createAuthClient } from "better-auth/react"

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
    }
})

export const { signIn, signUp, useSession } = authClient