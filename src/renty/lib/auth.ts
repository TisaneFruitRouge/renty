import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/prisma/db";

import { stripe } from "@better-auth/stripe"
import { stripe as stripeClient } from "@/lib/stripe"

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {  
        enabled: true
    },
    plugins: [
        nextCookies(),
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
            subscription: {
                enabled: true,
                plans: [
                    {
                        name: "basic",
                        priceId: process.env.STRIPE_BASIC_PRICE_ID!,
                        annualDiscountPriceId: process.env.STRIPE_BASIC_ANNUAL_DISCOUNT_PRICE_ID!,
                        limits: {
                            properties: 2
                        }
                    },
                    {
                        name: "pro",
                        priceId: process.env.STRIPE_PRO_PRICE_ID!,
                        annualDiscountPriceId: process.env.STRIPE_PRO_ANNUAL_DISCOUNT_PRICE_ID!,
                        limits: {
                            properties: 1000
                        }
                    }
                ]
            }
        }),
    ],
    user: {
        additionalFields: {
            address: { type: "string", required: false },
            city: { type: "string", required: false },
            state: { type: "string", required: false },
            country: { type: "string", required: false },
            postalCode: { type: "string", required: false },
        },
        includeInSession: [
            'address',
            'city',
            'state',
            'country',
            'postalCode'
        ]
    }
})