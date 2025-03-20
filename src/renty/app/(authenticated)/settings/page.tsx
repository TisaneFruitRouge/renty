import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import type { user } from '@prisma/client'
import { headers } from 'next/headers';
import { ClientSettingsPage } from '@/features/settings/components/ClientSettingsPage';
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
  const session = await auth.api.getSession({
    headers: await headers()
  });

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
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('description')}</p>
      </div>
      
      {/* Pass the server-fetched data to the client component */}
      <ClientSettingsPage 
        userData={userData} 
        subscriptionPlans={subscriptionPlans}
        activeSessions={activeSessions}
      />
    </div>
  );
}