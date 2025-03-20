"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { SubscriptionRequiredModal } from "./SubscriptionRequiredModal"
import { checkSubscriptionStatusAction } from "./actions"

export function SubscriptionCheck({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkSubscription = async () => {
      if (session?.user) {
        try {
          setIsChecking(true)
          // Use the server action to check subscription status
          const subscriptionData = await checkSubscriptionStatusAction();
          console.log(subscriptionData)
          setHasSubscription(subscriptionData.status === "active");
        } catch (error) {
          console.error("Failed to check subscription status:", error);
          setHasSubscription(false);
        } finally {
          setIsChecking(false);
        }
      } else if (!isPending) {
        setHasSubscription(false);
        setIsChecking(false);
      }
    }

    checkSubscription()
  }, [session, isPending]);
  
  // Don't show the modal while checking subscription status
  if (isChecking) {
    return <>{children}</>;
  }
  
  return (
    <>
      {children}
      <SubscriptionRequiredModal hasSubscription={hasSubscription} />
    </>
  );
}
