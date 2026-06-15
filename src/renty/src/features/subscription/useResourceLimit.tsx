"use client";

import { useEffect, useState } from "react";
import Link from "../../components/Link";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useSession } from "../../lib/auth-client";
import { useTranslations } from "../../lib/i18n";

type LimitableResource = "properties" | "tenants" | "receipts";

const authPlans = [
  { name: "basic", limits: { properties: 2 } },
  { name: "pro", limits: { properties: 1000 } },
] as const;

export function useResourceLimit(resource: LimitableResource, count = 0) {
  const { data: session } = useSession();
  const [planName, setPlanName] = useState<"basic" | "pro">("basic");

  useEffect(() => {
    if (session?.user) setPlanName("basic");
  }, [session]);

  const plan = authPlans.find((candidate) => candidate.name === planName);
  const limit = plan?.limits?.[resource as "properties"] || 0;

  return {
    isLimitReached: count >= limit,
    limit,
    count,
  };
}

export function ResourceLimitButton({
  resource,
  count,
  disabledMessage,
  children,
  ...props
}: {
  resource: LimitableResource;
  count: number;
  disabledMessage?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof Button>) {
  const { isLimitReached, limit } = useResourceLimit(resource, count);
  const t = useTranslations("subscription");
  const message = disabledMessage || `You've reached your ${resource} limit of ${limit}`;

  if (isLimitReached) {
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div className="inline-block cursor-not-allowed">
            <Button {...props} className={`${props.className || ""} pointer-events-none`} disabled>
              {children}
            </Button>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-4">
            <p className="text-sm font-medium">{message}</p>
            <div className="flex justify-end">
              <Link
                href="/settings?tab=subscription"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                {t("upgrade-subscription")}
              </Link>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Button {...props} disabled={props.disabled}>
      {children}
    </Button>
  );
}
