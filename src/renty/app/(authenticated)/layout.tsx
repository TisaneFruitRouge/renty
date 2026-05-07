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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border focus:border-border focus:rounded-md focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to main content
      </a>
      <AppSidebar />
      <main id="main-content" className="w-full min-w-0">
        {/* Mobile header — sticky bar with trigger and brand; hidden on md+ */}
        <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-3 md:hidden">
          <SidebarTrigger />
          <span className="font-semibold text-sm font-display">Renty</span>
        </header>
        {/* Desktop trigger — floating icon button above content */}
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>
        <SubscriptionRequiredModal hasSubscription={hasSubscription} />
        {children}
      </main>
    </SidebarProvider>
  );
}
