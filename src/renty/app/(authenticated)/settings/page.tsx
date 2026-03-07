import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import type { user } from '@prisma/client'
import { Suspense } from 'react'
import { ClientSettingsPage } from '@/features/settings/components/ClientSettingsPage';
import { PageTitle, PageDescription } from '@/components/ui/typography';
import { getActiveSessionsAction } from '@/features/settings/actions';
import { authPlans } from '@/features/subscription/plans';
import { redirect } from 'next/navigation';
import type { Plan } from '@/features/subscription/plans';

// Create a server-side function to get subscription plans with translations
async function getServerSubscriptionPlans() {
  const t = await getTranslations("subscription");

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
        t("plans.basic.features.notifications")
      ],
      limits: {
        properties: authPlans.find((p) => p.name === "basic")?.limits?.properties || 2
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
        properties: authPlans.find((p) => p.name === "pro")?.limits?.properties || 1000
      }
    }
  ];

  return plans;
}

export default async function SettingsPage() {
  // Fetch user data on the server
  const session = await getSession();

  const userData = session?.user as user | undefined
  
  // Get translations on the server
  const t = await getTranslations('settings')
  
  if (!userData) {
    // Redirect to sign-in if user is not authenticated
    redirect('/sign-in');
  }
  
  // Fetch subscription plans
  const subscriptionPlans = await getServerSubscriptionPlans();
  
  // Fetch active sessions
  const sessionsResult = await getActiveSessionsAction();
  const activeSessions = sessionsResult.success ? sessionsResult.data : [];
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <PageTitle>{t('title')}</PageTitle>
        <PageDescription className="mt-1">{t('description')}</PageDescription>
      </div>
      
      {/* Pass the server-fetched data to the client component */}
      <Suspense>
        <ClientSettingsPage
          userData={userData}
          subscriptionPlans={subscriptionPlans}
          activeSessions={activeSessions}
        />
      </Suspense>
    </div>
  );
}