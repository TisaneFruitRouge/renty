"use client"

import { Building2, Home, MessageSquare, ReceiptText, Settings, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || 
                  (item.url !== "/" && pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="hover:bg-accent hover:text-accent-foreground">
                      <Link 
                        href={item.url}
                        className={cn(
                          "relative",
                          isActive && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className={cn(
                          isActive && "text-accent-foreground hover:text-accent-foreground"
                        )} />
                        <span>{item.title}</span>
                        {isActive && (
                          <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-sm" />
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
