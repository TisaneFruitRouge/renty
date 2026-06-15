"use client";

import { CreditCard } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Plan } from "./types";
import { CurrentPlanCard } from "./CurrentPlanCard";
import { PaymentMethodCard } from "./PaymentMethodCard";

type SubscriptionTabProps = {
  plans: Plan[];
};

export function SubscriptionTab({ plans }: SubscriptionTabProps) {
  const t = useTranslations("settings");
  const currentPlan = plans.find(plan => plan.name === "basic");
  const otherPlan = plans.find(plan => plan.name !== currentPlan?.name);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>{t("tabs.subscription.title")}</CardTitle>
        </div>
        <CardDescription>{t("tabs.subscription.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currentPlan && otherPlan && <CurrentPlanCard currentPlan={currentPlan} otherPlan={otherPlan} />}
          <PaymentMethodCard />
        </div>
      </CardContent>
    </Card>
  );
}
