'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";

export function NotificationsTab() {
  const t = useTranslations('settings');
  const notificationSettings = [
    { id: 'paymentReminders', label: t('notifications.payment-reminders'), description: t('notifications.payment-reminders-description') },
    { id: 'leaseEnding', label: t('notifications.lease-ending'), description: t('notifications.lease-ending-description') },
    { id: 'messages', label: t('notifications.messages'), description: t('notifications.messages-description') },
  ];
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>{t('tabs.notifications.title')}</CardTitle>
        </div>
        <CardDescription>{t('tabs.notifications.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {notificationSettings.map(setting => (
            <div key={setting.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={setting.id} className="text-base font-medium">{setting.label}</Label>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Switch 
                id={setting.id} 
                defaultChecked={setting.id === 'messages' || setting.id === 'paymentReminders'} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
