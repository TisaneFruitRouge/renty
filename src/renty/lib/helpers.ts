import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// This is a higher-order function that adds the user ID to an action function
// It works with both server components and client components
export function addUserIdToAction<T extends unknown[], R>(
  action: (userId: string, ...args: T) => Promise<R>
) {
  // Return a function with the same signature as the original action
  // but without the userId parameter
  return async function(...args: T): Promise<R> {
    // Get the user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    // Check if the user is authenticated
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    // Call the original action with the user ID and the provided arguments
    return action(session.user.id, ...args);
  };
}