import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useTranslations } from "@/lib/i18n";
import { PageDescription, PageTitle } from "@/components/ui/typography";
import { useCurrentUser } from "../../lib/current-user";
import { ClientSettingsPage } from "./ClientSettingsPage";
import type { SettingsUser } from "./types";
import { useSubscriptionPlans } from "./useSubscriptionPlans";

type SessionUser = Partial<SettingsUser> & {
  id?: string;
  _id?: string;
  userId?: string;
  createdAt?: Date | number | string | null;
  updatedAt?: Date | number | string | null;
};

function toDate(value: SessionUser["createdAt"]) {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

export function SettingsPage() {
  const t = useTranslations("settings");
  const { data, isPending, userId } = useCurrentUser();
  const subscriptionPlans = useSubscriptionPlans();

  const userData = useMemo<SettingsUser | null>(() => {
    const sessionUser = data?.user as SessionUser | undefined;
    if (!sessionUser || !userId) return null;

    return {
      id: userId,
      name: sessionUser.name ?? "",
      email: sessionUser.email ?? "",
      emailVerified: Boolean(sessionUser.emailVerified),
      image: sessionUser.image ?? null,
      createdAt: toDate(sessionUser.createdAt),
      updatedAt: toDate(sessionUser.updatedAt),
      address: sessionUser.address ?? null,
      city: sessionUser.city ?? null,
      country: sessionUser.country ?? null,
      postalCode: sessionUser.postalCode ?? null,
      state: sessionUser.state ?? null,
      stripeCustomerId: sessionUser.stripeCustomerId ?? null,
    };
  }, [data?.user, userId]);

  if (isPending) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <PageTitle>{t("title")}</PageTitle>
        <PageDescription className="mt-1">{t("description")}</PageDescription>
      </div>

      <ClientSettingsPage userData={userData} subscriptionPlans={subscriptionPlans} />
    </div>
  );
}
