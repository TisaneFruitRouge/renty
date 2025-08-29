// features/subscription/hooks/useResourceLimit.tsx
'use client';

import { useSession } from "@/lib/auth-client";
import { authPlans } from "../plans";
import { useState, useEffect } from "react";
import { LimitableResource } from "../limits";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * Simple hook to check if a user has reached their resource limit
 * @param resource The resource type to check (properties, tenants, etc.)
 * @param count The current count of resources
 * @returns Object with limit information
 */
export function useResourceLimit(resource: LimitableResource, count: number = 0) {
  // Get the user's plan (defaulting to basic if not available)
  const { data: session } = useSession();
  const [planName, setPlanName] = useState<"basic" | "pro">("basic");
  
  // Fetch the user's plan when session is available
  useEffect(() => {
    // This could be expanded to fetch from an API if needed
    if (session?.user) {
      // For now, just use the basic plan as default
      setPlanName("basic");
    }
  }, [session]);
  
  // Get the plan limits
  const plan = authPlans.find(p => p.name === planName);
  const limit = plan?.limits?.[resource] || 0;
  
  return {
    isLimitReached: count >= limit,
    limit,
    count
  };
}

/**
 * A simple component that wraps a button to disable it when a resource limit is reached
 */
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
  
  const message = disabledMessage || `You've reached your ${resource} limit of ${limit}`;
  
  const t = useTranslations('subscription');
  
  if (isLimitReached) {
    return (
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div className="inline-block cursor-not-allowed">
            <Button
              {...props}
              className={`${props.className || ''} pointer-events-none`}
              disabled={true}
            >
              {children}
            </Button>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-4">
            <p className="text-sm font-medium">{message}</p>
            <div className="flex justify-end">
              <Link 
                href="/settings/subscription" 
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                {t('upgrade-subscription')}
              </Link>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }
  
  return (
    <Button
      {...props}
      disabled={props.disabled}
    >
      {children}
    </Button>
  );
}