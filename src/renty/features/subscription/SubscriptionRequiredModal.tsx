"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { CreditCard, Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSubscriptionPlans } from "./plans"



interface SubscriptionRequiredModalProps {
  hasSubscription: boolean
}

export function SubscriptionRequiredModal({ hasSubscription }: SubscriptionRequiredModalProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations("subscription.required-modal")
  const plans = useSubscriptionPlans()
  
  useEffect(() => {
    setOpen(!hasSubscription)
  }, [hasSubscription])

  const handleUpgrade = async (planName: string) => {
    try {
      const { error } = await authClient.subscription.upgrade({
        plan: planName,
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      })

      if (error) {
        console.error("Subscription upgrade error:", error)
      }
    } catch (error) {
      console.error("Failed to initiate subscription:", error)
    }
  }

  // Don't render anything if the user has a subscription
  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent className="sm:max-w-[600px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className="border rounded-lg p-4 flex flex-col hover:border-primary transition-colors"
            >
              <div className="font-medium text-lg">{plan.title}</div>
              <div className="text-2xl font-bold mt-2 mb-4">{plan.price}</div>
              
              <ul className="space-y-2 flex-grow mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleUpgrade(plan.name)}
                className="w-full gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {t("subscribe-button")}
              </Button>
            </div>
          ))}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="w-full text-center text-xs text-muted-foreground">
            {t("disclaimer")}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
