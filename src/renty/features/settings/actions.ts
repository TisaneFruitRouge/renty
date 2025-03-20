'use server'

import { updateUser, getUserSessions, deleteSession } from "./db"
import { updateUserSchema, type UpdateUserInput } from "./schemas"
import { addUserIdToAction } from "@/lib/helpers"
import { UAParser } from "ua-parser-js"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export interface SessionInfo {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    isCurrentSession: boolean;
    deviceInfo: {
        browser: string;
        os: string;
        device: string;
    };
    location?: string;
}

export const updateUserAction = addUserIdToAction(async (userId: string, input: UpdateUserInput) => {
    // Check if the user is trying to update their own profile
    if (userId !== input.id) {
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
});

export const getActiveSessionsAction = addUserIdToAction(async (userId: string) => {
    try {
        // Get the current session to mark it
        const currentSession = await auth.api.getSession({
            headers: await headers()
        });
        
        if (!currentSession) {
            throw new Error("No active session found");
        }
        
        // Get all sessions for the user
        const sessions = await getUserSessions(userId);
        
        // Parse user agent and format sessions
        const formattedSessions: SessionInfo[] = sessions.map(session => {
            const parser = new UAParser(session.userAgent || "");
            const browser = parser.getBrowser();
            const os = parser.getOS();
            const device = parser.getDevice();
            
            // Determine if this is the current session
            const isCurrentSession = session.id === currentSession.session.id;
            
            return {
                id: session.id,
                userAgent: session.userAgent,
                ipAddress: session.ipAddress,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                isCurrentSession,
                deviceInfo: {
                    browser: browser.name || 'Unknown',
                    os: os.name || 'Unknown',
                    device: device.type ? `${device.vendor || ''} ${device.model || ''}`.trim() : 'Desktop'
                },
                // We could add geolocation based on IP in a future version
                location: 'Unknown location'
            };
        });
        
        return {
            success: true,
            data: formattedSessions
        };
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch sessions'
        };
    }
});

export const removeSessionAction = addUserIdToAction(async (userId: string, sessionId: string) => {
    try {
        // Check if this is the current session
        const currentSession = await auth.api.getSession({
            headers: await headers()
        });
        
        if (!currentSession) {
            throw new Error("No active session found");
        }
        
        // Prevent removing the current session through this method
        // (current session should be handled through logout)
        if (sessionId === currentSession.session.id) {
            throw new Error("Cannot remove the current session this way. Please use logout instead.");
        }
        
        // Delete the session
        await deleteSession(sessionId, userId);
        
        // Revalidate the settings page to show updated sessions
        revalidatePath('/settings');
        
        return {
            success: true
        };
    } catch (error) {
        console.error('Error removing session:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove session'
        };
    }
});
