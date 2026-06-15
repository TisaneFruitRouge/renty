"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "@/lib/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AppSettingsTab } from "./AppSettingsTab";
import { NotificationsTab } from "./NotificationsTab";
import { PersonalInfoTab } from "./PersonalInfoTab";
import { SecurityTab } from "./SecurityTab";
import { SettingsNav } from "./SettingsNav";
import { SubscriptionTab } from "./SubscriptionTab";
import { UserProfileCard } from "./UserProfileCard";
import type { Plan, SettingsUser } from "./types";

type ClientSettingsPageProps = {
  userData: SettingsUser;
  subscriptionPlans: Plan[];
};

export function ClientSettingsPage({ userData, subscriptionPlans }: ClientSettingsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "personal";

  const setActiveTab = useCallback((tab: string) => {
    router.replace(`/settings?tab=${tab}`);
  }, [router]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
      <div className="space-y-4">
        <UserProfileCard user={userData} />
        <Card>
          <CardContent className="p-4">
            <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </CardContent>
        </Card>
      </div>

      <div>
        {activeTab === "personal" && <PersonalInfoTab user={userData} />}
        {activeTab === "app" && <AppSettingsTab />}
        {activeTab === "subscription" && <SubscriptionTab plans={subscriptionPlans} />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}
