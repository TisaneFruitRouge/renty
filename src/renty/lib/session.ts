import { cache } from "react";
import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Returns the current session, memoized for the lifetime of a single request.
 * Use this instead of calling auth.api.getSession() directly so that multiple
 * server components rendered in the same request share a single DB lookup.
 */
export const getSession = cache(async () => {
    return auth.api.getSession({ headers: await headers() });
});
