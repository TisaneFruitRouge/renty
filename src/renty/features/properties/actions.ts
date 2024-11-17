'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import createProperty from "./db"
import { createPropertySchema } from "./schemas"
import { headers } from "next/headers"

export type CreatePropertyInput = z.infer<typeof createPropertySchema>

export async function createPropertyAction(values: CreatePropertyInput) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    });

    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }

    const validatedFields = createPropertySchema.safeParse(values)
    if (!validatedFields.success) {
        throw new Error("Invalid fields")
    }

    const { title, address, city, state, country, postalCode } = validatedFields.data

    try {
        const property = await createProperty(
            session.user.id,
            title,
            address,
            city,
            state,
            country,
            postalCode
        )

        revalidatePath("/")
        return { success: true, data: property }
    } catch (error) {
        console.error("Error creating property:", error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to create property" 
        }
    }
}