"use client";

import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function AppSettingsTab() {
  const t = useTranslations("settings");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const appSettings = [
    { id: "darkMode", label: t("app-settings.dark-mode"), description: t("app-settings.dark-mode-description") },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>{t("tabs.app.title")}</CardTitle>
        </div>
        <CardDescription>{t("tabs.app.description")}</CardDescription>
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
                checked={mounted && resolvedTheme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
