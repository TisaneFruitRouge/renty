"use client"

import type { tenant } from "@prisma/client"
import { Users } from "lucide-react"
import TenantListCard from "./TenantListCard"
import { useTranslations } from "next-intl"

interface TenantsListProps {
    tenants: tenant[]
}

export default function TenantsList({tenants}: TenantsListProps) {
    const t = useTranslations('tenants')

    return (
        <div className="relative">
            {tenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 mt-12">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <h2 className="text-lg text-muted-foreground">{t("no-tenants-found")}</h2>
                </div>
            ) : (
                <>
                    <h2 className="text-xl underline font-semibold mb-6">{t("title")}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tenants.map((tenant) => (
                            <TenantListCard key={tenant.id} tenant={tenant} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
