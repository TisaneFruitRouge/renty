import { stripeClient } from "@better-auth/stripe/client";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authBaseURL =
  import.meta.env.VITE_AUTH_URL ||
  import.meta.env.VITE_CONVEX_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : undefined);

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  user: {
    includeInSession: [
      "userId",
      "address",
      "city",
      "state",
      "country",
      "postalCode",
      "stripeCustomerId",
    ],
  },
  plugins: [
    crossDomainClient(),
    convexClient(),
    stripeClient({
      subscription: true,
    }),
  ],
});

export const { signIn, signUp, useSession } = authClient;
