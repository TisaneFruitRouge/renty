'use client';

import { useState } from 'react';
import type { user } from "@prisma/client";
import type { Plan } from "@/features/subscription/plans";
import type { SessionInfo } from "@/features/settings/actions";
import { 
  UserProfileCard,
  SettingsNav,
  PersonalInfoTab,
  AppSettingsTab,
  SubscriptionTab,
  NotificationsTab,
  SecurityTab
} from "@/features/settings/components";
import { Card, CardContent } from "@/components/ui/card";

type ClientSettingsPageProps = {
  userData: user;
  subscriptionPlans: Plan[];
  activeSessions?: SessionInfo[];
};

export function ClientSettingsPage({ 
  userData, 
  subscriptionPlans, 
  activeSessions 
}: ClientSettingsPageProps) {
  const [activeTab, setActiveTab] = useState('personal');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
      <div className="space-y-4">
        {/* Pass server-fetched user data to client components */}
        <UserProfileCard user={userData} />
        <Card>
          <CardContent className="p-4">
            <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </CardContent>
        </Card>
      </div>
      
      <div>
        {activeTab === 'personal' && <PersonalInfoTab user={userData} />}
        {activeTab === 'app' && <AppSettingsTab />}
        {activeTab === 'subscription' && <SubscriptionTab plans={subscriptionPlans} />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <SecurityTab initialSessions={activeSessions} />}
      </div>
    </div>
  );
}
