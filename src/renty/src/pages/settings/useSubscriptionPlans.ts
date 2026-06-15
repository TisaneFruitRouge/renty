import { useTranslations } from "@/lib/i18n";
import type { Plan } from "./types";

const authPlans = [
  { name: "basic", limits: { properties: 2 } },
  { name: "pro", limits: { properties: 1000 } },
];

export function useSubscriptionPlans() {
  const t = useTranslations("subscription");

  const plans: Plan[] = [
    {
      name: "basic",
      title: t("plans.basic.title"),
      price: t("plans.basic.price"),
      features: [
        t("plans.basic.features.properties", { count: authPlans.find((p) => p.name === "basic")?.limits?.properties || 2 }),
        t("plans.basic.features.receipts"),
        t("plans.basic.features.tenants"),
        t("plans.basic.features.messages"),
        t("plans.basic.features.notifications"),
      ],
      limits: {
        properties: authPlans.find((p) => p.name === "basic")?.limits?.properties || 2,
      },
    },
    {
      name: "pro",
      title: t("plans.pro.title"),
      price: t("plans.pro.price"),
      features: [
        t("plans.pro.features.properties"),
        t("plans.pro.features.all-basic-features"),
        t("plans.pro.features.support"),
        t("plans.pro.features.reporting"),
      ],
      limits: {
        properties: authPlans.find((p) => p.name === "pro")?.limits?.properties || 1000,
      },
    },
  ];

  return plans;
}
