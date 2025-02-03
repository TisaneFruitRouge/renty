import { getTranslations } from "next-intl/server";
import { getPropertiesForUser } from "@/features/properties/db";
import { auth } from "@/lib/auth";
import PropertiesList from "@/features/properties/components/PropertiesList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { headers } from "next/headers";

export default async function PropertiesPage() {
    const t = await getTranslations('properties');
    const session = await auth.api.getSession({
        headers: await headers()
      });

    if (!session?.user) {
        return null;
    }

    const properties = await getPropertiesForUser(session.user.id);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('description')}</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('add')}
                </Button>
            </div>

            <PropertiesList properties={properties} />
        </div>
    );
}