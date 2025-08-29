import { prisma } from "@/prisma/db"
import type { user, session } from "@prisma/client"
import type { UpdateUserOutput } from "./schemas"

export async function updateUser(input: UpdateUserOutput): Promise<user> {
    return prisma.user.update({
        where: { id: input.id },
        data: {
            name: input.name,
            email: input.email,
            image: "",
            address: input.address,
            city: input.city,
            state: input.state,
            country: input.country,
            postalCode: input.postalCode,
            updatedAt: new Date(),
        },
    })
}

/**
 * Get all active sessions for a user
 * @param userId The ID of the user whose sessions to fetch
 * @returns Array of session objects
 */
export async function getUserSessions(userId: string): Promise<session[]> {
    return prisma.session.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
}

/**
 * Delete a specific session
 * @param sessionId The ID of the session to delete
 * @param userId The ID of the user who owns the session (for security)
 * @returns The deleted session
 */
export async function deleteSession(sessionId: string, userId: string): Promise<session> {
    return prisma.session.delete({
        where: {
            id: sessionId,
            userId: userId // Ensure the session belongs to the user
        }
    });
}