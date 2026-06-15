"use client";

import { Building2, FileText, Home, LogOut, MessageSquare, ReceiptText, Settings, Users } from "lucide-react";
import Link from "@/components/Link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "@/lib/i18n";
import { usePathname, useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { state } = useSidebar();

  const items = [
    { title: t("menu.home"), url: "/", icon: Home },
    { title: t("menu.properties"), url: "/properties", icon: Building2 },
    { title: t("menu.tenants"), url: "/tenants", icon: Users },
    { title: t("menu.leases"), url: "/leases", icon: FileText },
    { title: t("menu.rent-receipts"), url: "/rent-receipts", icon: ReceiptText },
    { title: t("menu.channels"), url: "/channels", icon: MessageSquare },
    { title: t("menu.settings"), url: "/settings", icon: Settings },
  ];

  const signOut = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: t("logout-error-title"),
        description: error.message,
      });
      return;
    }
    router.replace("/sign-in");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-14 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <img src="/renty.svg" alt="Renty" className="h-6 w-6 object-contain" />
          </div>
          <span className="font-display text-base font-semibold tracking-tight text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
            Renty
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Link
                        href={item.url}
                        className={cn("relative", isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                        <span className="leading-none">{item.title}</span>
                        {isActive && <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-sm bg-sidebar-primary" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => void signOut()}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn("leading-none", state === "collapsed" && "sr-only")}>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
