import { betterAuth } from "better-auth/minimal";
import { convexAdapter } from "@convex-dev/better-auth";
import { buildAuthOptions } from "../authOptions";

export const auth = betterAuth(
  buildAuthOptions(convexAdapter({} as any, { adapter: {} as any })),
);
