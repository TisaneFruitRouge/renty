import { cache } from "react";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/convex-auth-server";

/**
 * Returns the current session, memoized for the lifetime of a single request.
 * Use this instead of calling auth.api.getSession() directly so that multiple
 * server components rendered in the same request share a single DB lookup.
 */
export const getSession = cache(async () => {
    const user = await fetchAuthQuery(api.auth.currentUser);

    if (!user) {
        return null;
    }

    return {
        user: {
            id: user.userId ?? user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            address: user.address,
            city: user.city,
            state: user.state,
            country: user.country,
            postalCode: user.postalCode,
            stripeCustomerId: user.stripeCustomerId,
        },
        session: {
            id: "",
        },
    };
});
