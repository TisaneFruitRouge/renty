import "server-only";

import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | undefined;

export function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;

  if (!convexUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL. Run `yarn convex:dev` or set the Convex deployment URL.",
    );
  }

  client ??= new ConvexHttpClient(convexUrl);
  return client;
}
