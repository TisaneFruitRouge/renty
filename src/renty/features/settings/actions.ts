'use server'

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { updateUser } from "./db"
import { updateUserSchema, type UpdateUserInput } from "./schemas"

export async function updateUserAction(input: UpdateUserInput) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Not authenticated")
    }

    if (session.user.id !== input.id) {
        throw new Error("Not authorized")
    }

    const result = updateUserSchema.safeParse(input)
    if (!result.success) {
        throw new Error(result.error.message)
    }

    const updatedUser = await updateUser(result.data)

    return {
        data: updatedUser,
    }
}
