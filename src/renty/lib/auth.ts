import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const auth = betterAuth({
    database: new Pool({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB,
        ssl: process.env.NODE_ENV === "production" // if production, yes, else no     
    }),
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