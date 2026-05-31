import { CONVEX_URL } from "@/constants/config";
import { ConvexReactClient } from "convex/react";

if (!CONVEX_URL) {
  throw new Error("Missing Convex URL. Set CONVEX_URL for the Expo app.");
}

export const convex = new ConvexReactClient(CONVEX_URL);
