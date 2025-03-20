'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useTheme } from "next-themes";

export function AppSettingsTab() {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  
  const appSettings = [
    { id: 'darkMode', label: t('app-settings.dark-mode'), description: t('app-settings.dark-mode-description') },
  ];
  
  // Handle dark mode toggle
  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>{t('tabs.app.title')}</CardTitle>
        </div>
        <CardDescription>{t('tabs.app.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {appSettings.map(setting => (
            <div key={setting.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={setting.id} className="text-base font-medium">{setting.label}</Label>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Switch 
                id={setting.id} 
                checked={theme === 'dark'}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
