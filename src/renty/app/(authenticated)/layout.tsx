import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SubscriptionRequiredModal } from "@/features/subscription/SubscriptionRequiredModal";
import { getActiveSubscription } from "@/features/subscription/db";
import { getSession } from "@/lib/session";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const hasSubscription = !!(await getActiveSubscription(session?.user.stripeCustomerId));

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <SubscriptionRequiredModal hasSubscription={hasSubscription} />
        {children}
      </main>
    </SidebarProvider>
  );
}
