"use client"

import { Building2, FileText, Home, MessageSquare, ReceiptText, Settings, Users } from "lucide-react"
import { useTranslations } from "next-intl"
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
} from "@/components/ui/sidebar"
import LogoutButton from "@/features/auth/components/LogoutButton"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function AppSidebar() {
  const t = useTranslations('sidebar');
  const pathname = usePathname();

  const {
    state,
  } = useSidebar()
  // Menu items with translations
  const items = [
    {
      title: t('menu.home'),
      url: "/",
      icon: Home,
    },
    {
      title: t('menu.properties'),
      url: "/properties",
      icon: Building2,
    },
    {
      title: t('menu.tenants'),
      url: "/tenants",
      icon: Users,
    },
    {
      title: t('menu.leases'),
      url: "/leases",
      icon: FileText,
    },
    {
      title: t('menu.rent-receipts'),
      url: "/rent-receipts",
      icon: ReceiptText,
    },
    {
      title: t('menu.channels'),
      url: "/channels",
      icon: MessageSquare,
    },
    {
      title: t('menu.settings'),
      url: "/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 h-14">
          <div className="h-7 w-7 rounded-md bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-sidebar-primary-foreground font-display leading-none select-none">R</span>
          </div>
          <span className="font-semibold text-base text-sidebar-accent-foreground tracking-tight font-display group-data-[collapsible=icon]:hidden">
            Renty
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url ||
                  (item.url !== "/" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground">
                      <Link
                        href={item.url}
                        className={cn(
                          "relative",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className={cn(
                          isActive && "text-sidebar-primary"
                        )} />
                        <span>{item.title}</span>
                        {isActive && (
                          <span className="absolute inset-y-0 left-0 w-0.5 bg-sidebar-primary rounded-r-sm" />
                        )}
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
            <LogoutButton sidebarState={state} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
