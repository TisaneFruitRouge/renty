import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SubscriptionCheck } from "@/features/subscription/SubscriptionCheck";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <SubscriptionCheck>
          {children}
        </SubscriptionCheck>
      </main>
    </SidebarProvider>
  );
}
