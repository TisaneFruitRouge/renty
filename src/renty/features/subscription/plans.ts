import { useTranslations } from "next-intl";

export type Plan = {
  name: string;
  title: string;
  price: string;
  features: string[];
  limits: {
    properties: number;
    tenants?: number;
    receipts?: number;
  };
};

// Define the structure for auth plan limits
export type AuthPlan = {
  name: string;
  limits?: {
    properties?: number;
    tenants?: number;
    receipts?: number;
  };
};

// Hardcoded plan limits that match the auth.ts configuration
// This is a fallback since we can't directly access the auth config object
export const authPlans: AuthPlan[] = [
  {
    name: "basic",
    limits: {
      properties: 2
    }
  },
  {
    name: "pro",
    limits: {
      properties: 1000
    }
  }
];

// This hook returns the plans with translated strings
export function useSubscriptionPlans() {
  const t = useTranslations("subscription");

  const plans: Plan[] = [
    {
      name: "basic",
      title: t("plans.basic.title"),
      price: t("plans.basic.price"),
      features: [
        t("plans.basic.features.properties", { count: authPlans.find((p: AuthPlan) => p.name === "basic")?.limits?.properties || 2 }),
        t("plans.basic.features.receipts"),
        t("plans.basic.features.tenants"),
        t("plans.basic.features.messages"),
        t("plans.basic.features.notifications")
      ],
      limits: {
        properties: authPlans.find((p: AuthPlan) => p.name === "basic")?.limits?.properties || 2
      }
    },
    {
      name: "pro",
      title: t("plans.pro.title"),
      price: t("plans.pro.price"),
      features: [
        t("plans.pro.features.properties"),
        t("plans.pro.features.all-basic-features"),
        t("plans.pro.features.support"),
        t("plans.pro.features.reporting")
      ],
      limits: {
        properties: authPlans.find((p: AuthPlan) => p.name === "pro")?.limits?.properties || 1000
      }
    }
  ];

  return plans;
}
