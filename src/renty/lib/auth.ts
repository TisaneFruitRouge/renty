import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

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
    plugins: [nextCookies()],
    user: {
        additionalFields: {
            address: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            country: { type: "string" },
            postalCode: { type: "string" },
        }
    }
})