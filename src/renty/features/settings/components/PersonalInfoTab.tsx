'use client';

import { useTranslations } from "next-intl";
import type { user } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserInfoForm } from "@/features/settings/components/UserInfoForm";
import { User } from "lucide-react";

type PersonalInfoTabProps = {
  user: user;
};

export function PersonalInfoTab({ user }: PersonalInfoTabProps) {
  const t = useTranslations('settings');
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>{t('tabs.personal.title')}</CardTitle>
        </div>
        <CardDescription>{t('tabs.personal.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <UserInfoForm 
          user={user}
          isPending={false}
          error={null}
        />
      </CardContent>
    </Card>
  );
}
