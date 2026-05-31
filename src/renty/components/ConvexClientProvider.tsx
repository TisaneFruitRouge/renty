"use client";

import { ReactNode, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

type ConvexClientProviderProps = {
  children: ReactNode;
};

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  const convex = useMemo(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
    [],
  );

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
