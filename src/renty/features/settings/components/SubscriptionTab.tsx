'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import type { Plan } from "@/features/subscription/plans";
import { CurrentPlanCard } from "@/features/subscription/components/CurrentPlanCard";
import { PaymentMethodCard } from "@/features/subscription/components/PaymentMethodCard";

type SubscriptionTabProps = {
  plans: Plan[];
};

export function SubscriptionTab({ plans }: SubscriptionTabProps) {
  const t = useTranslations('settings');
  const currentPlan = plans.find(plan => plan.name === 'basic');
  const otherPlan = plans.find(plan => plan.name !== currentPlan?.name);
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>{t('tabs.subscription.title')}</CardTitle>
        </div>
        <CardDescription>{t('tabs.subscription.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Plan */}
          {currentPlan && otherPlan && (
            <CurrentPlanCard currentPlan={currentPlan} otherPlan={otherPlan} />
          )}
          
          {/* Payment Method */}
          <PaymentMethodCard />
        </div>
      </CardContent>
    </Card>
  );
}
