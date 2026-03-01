import { getTranslations } from "next-intl/server";
import { getPropertiesForUser } from "@/features/properties/db";
import { getSession } from "@/lib/session";
import PropertiesList from "@/features/properties/components/PropertiesList";
import CreatePropertyModal from "@/features/properties/components/CreatePropertyModal";

export default async function PropertiesPage() {
    const t = await getTranslations('properties');
    const session = await getSession();

    if (!session?.user) {
        return null;
    }

    const properties = await getPropertiesForUser(session.user.id);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('description')}</p>
                </div>
                <CreatePropertyModal />
            </div>

            <PropertiesList properties={properties} />
        </div>
    );
}