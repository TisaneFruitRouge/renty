'use client';

import { useTranslations } from "next-intl";
import { Bell, CreditCard, Lock, Settings, User } from "lucide-react";

type SettingsNavProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export function SettingsNav({ activeTab, setActiveTab }: SettingsNavProps) {
  const t = useTranslations('settings');
  
  const navItems = [
    { id: 'personal', icon: <User className="h-4 w-4 mr-2" />, label: t('tabs.personal.title') },
    { id: 'app', icon: <Settings className="h-4 w-4 mr-2" />, label: t('tabs.app.title') },
    { id: 'subscription', icon: <CreditCard className="h-4 w-4 mr-2" />, label: t('tabs.subscription.title') },
    { id: 'notifications', icon: <Bell className="h-4 w-4 mr-2" />, label: t('tabs.notifications.title') },
    { id: 'security', icon: <Lock className="h-4 w-4 mr-2" />, label: t('tabs.security.title') },
  ];
  
  return (
    <div className="flex flex-col space-y-1 w-full">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex items-center text-start px-3 py-2.5 text-sm rounded-md transition-colors ${
            activeTab === item.id 
              ? 'bg-primary text-primary-foreground font-medium' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
