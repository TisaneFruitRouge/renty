"use client";

import { User } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SettingsUser } from "./types";
import { UserInfoForm } from "./UserInfoForm";

type PersonalInfoTabProps = {
  user: SettingsUser;
};

export function PersonalInfoTab({ user }: PersonalInfoTabProps) {
  const t = useTranslations("settings");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>{t("tabs.personal.title")}</CardTitle>
        </div>
        <CardDescription>{t("tabs.personal.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <UserInfoForm user={user} isPending={false} error={null} />
      </CardContent>
    </Card>
  );
}
