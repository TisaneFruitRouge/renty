import { useQuery } from "convex/react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";

type SessionUser = {
  id?: string;
  userId?: string;
  _id?: string;
};

type ConvexAuthUser = SessionUser | null | undefined;

export function useCurrentUser() {
  const { data, isPending } = useSession();
  const convexUser = useQuery(api.auth.currentUser) as ConvexAuthUser;
  const user = data?.user as SessionUser | undefined;
  const userId =
    convexUser?.userId ??
    convexUser?.id ??
    convexUser?._id ??
    user?.userId ??
    user?.id ??
    user?._id ??
    "";

  return {
    data,
    isPending: isPending || convexUser === undefined,
    userId,
    user: convexUser ?? data?.user ?? null,
  };
}

export function useCurrentUserId() {
  return useCurrentUser().userId;
}
