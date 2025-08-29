'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import { Plan } from "../plans";

type CurrentPlanCardProps = {
  currentPlan: Plan;
  otherPlan: Plan | undefined;
};

export function CurrentPlanCard({ currentPlan, otherPlan }: CurrentPlanCardProps) {
  const t = useTranslations('settings');
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const { toast } = useToast();
  
  const handleChangePlan = async (planName: string) => {
    try {
      setIsChangingPlan(true);
      const targetPlan = planName === 'basic' ? 'basic' : 'pro';
      
      const { error } = await authClient.subscription.upgrade({
        plan: targetPlan,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?tab=subscription`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?tab=subscription`,
      });

      if (error) {
        console.error("Plan change error:", error);
        toast({
          title: t('subscription.change-plan-error'),
          description: error.message || t('subscription.change-plan-error-description'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to change subscription plan:", error);
      toast({
        title: t('subscription.change-plan-error'),
        description: t('subscription.change-plan-error-description'),
        variant: "destructive"
      });
    } finally {
      setIsChangingPlan(false);
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-medium text-lg">{currentPlan.title}</h3>
          <p className="text-sm text-muted-foreground">{currentPlan.price}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => handleChangePlan(otherPlan?.name || 'pro')}
          disabled={isChangingPlan}
        >
          {isChangingPlan ? (
            <>
              <Check className="mr-2 h-4 w-4 animate-spin" />
              {t('subscription.changing-plan')}
            </>
          ) : (
            currentPlan.name === 'basic' ? 
              t('subscription.upgrade-plan') : 
              t('subscription.downgrade-plan')
          )}
        </Button>
      </div>
      <div className="mt-4 space-y-2">
        {currentPlan.features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
