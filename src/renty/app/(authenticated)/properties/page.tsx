import { getTranslations } from "next-intl/server";
import { getPropertiesForUser } from "@/features/properties/db";
import { getSession } from "@/lib/session";
import PropertiesList from "@/features/properties/components/PropertiesList";
import CreatePropertyModal from "@/features/properties/components/CreatePropertyModal";
import { PageTitle, PageDescription } from "@/components/ui/typography";

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
                    <PageTitle>{t('title')}</PageTitle>
                    <PageDescription className="mt-1">{t('description')}</PageDescription>
                </div>
                <CreatePropertyModal />
            </div>

            <PropertiesList properties={properties} />
        </div>
    );
}