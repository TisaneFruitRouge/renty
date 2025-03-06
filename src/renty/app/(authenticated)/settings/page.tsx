'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserInfoForm } from "@/features/settings/components/UserInfoForm"
import { authClient } from "@/lib/auth-client"
import type { user } from "@prisma/client"
import { useTranslations } from "next-intl"

function PersonalInfoTab() {
    const t = useTranslations('settings')

    const { 
        data,
        isPending,
        error
    } = authClient.useSession();

    if (!data) {
        return null;
    }
    
    // Ensure we have all user data including location information
    const userData = data.user as user;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t('tabs.personal.title')}</h2>
                <p className="text-muted-foreground">
                    {t('tabs.personal.description')}
                </p>
            </div>
            <div className="grid gap-4">
                <UserInfoForm 
                    user={userData}
                    isPending={isPending}
                    error={error}
                />
            </div>
        </div>
    )
}

function AppSettingsTab() {
    const t = useTranslations('settings')
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t('tabs.app.title')}</h2>
                <p className="text-muted-foreground">
                    {t('tabs.app.description')}
                </p>
            </div>
            <div className="grid gap-4">
                {/* Add settings here */}
                <p className="text-muted-foreground">Bientôt...</p>
            </div>
        </div>
    )
}

export default function SettingsPage() {
    const t = useTranslations('settings')

    return (
        <div className="w-full p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>

                <Tabs defaultValue="personal" className="space-y-4">
                    <TabsList className="w-full">
                        <TabsTrigger className="w-full" value="personal">{t('tabs.personal.title')}</TabsTrigger>
                        <TabsTrigger className="w-full" value="app">{t('tabs.app.title')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal">
                        <PersonalInfoTab />
                    </TabsContent>
                    <TabsContent value="app">
                        <AppSettingsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}