import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { reviveDates } from "@/lib/convex-map";
import type { user, session } from "@prisma/client"
import type { UpdateUserOutput } from "./schemas"

export async function updateUser(input: UpdateUserOutput): Promise<user> {
    const updated = await getConvexClient().mutation(api.settings.updateUser, {
        id: input.id,
        name: input.name,
        email: input.email,
        image: "",
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        country: input.country || null,
        postalCode: input.postalCode || null,
    });
    return reviveDates(updated) as unknown as user;
}

/**
 * Get all active sessions for a user
 * @param userId The ID of the user whose sessions to fetch
 * @returns Array of session objects
 */
export async function getUserSessions(userId: string): Promise<session[]> {
    const sessions = await getConvexClient().query(api.settings.listSessions, { userId });
    return reviveDates(sessions) as unknown as session[];
}

/**
 * Delete a specific session
 * @param sessionId The ID of the session to delete
 * @param userId The ID of the user who owns the session (for security)
 * @returns The deleted session
 */
export async function deleteSession(sessionId: string, userId: string): Promise<session> {
    const deleted = await getConvexClient().mutation(api.settings.deleteSession, {
        sessionId,
        userId,
    });
    return reviveDates(deleted) as unknown as session;
}
