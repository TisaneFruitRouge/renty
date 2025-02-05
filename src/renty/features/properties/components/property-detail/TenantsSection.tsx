import { useTranslations } from "next-intl"
import TenantSection from "@/features/tenant/components/TenantSection"
import type { tenant } from "@prisma/client"

interface TenantsSectionProps {
    propertyId: string;
    initialTenant: tenant;
    availableTenants: tenant[];
}

export default function TenantsSection({ propertyId, initialTenant, availableTenants }: TenantsSectionProps) {
    const t = useTranslations('property')

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("current-tenants")}</h2>
                <TenantSection propertyId={propertyId} initialTenant={initialTenant} availableTenants={availableTenants} />
            </div>
        </div>
    )
}
