"use client"

import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import type { tenant } from "@prisma/client"
import { User, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

type TenantListCardProps = {
    tenant: tenant
}

export default function TenantListCard({ tenant }: TenantListCardProps) {
    const t = useTranslations('tenants.tenant-card')

    return (
        <Link href={`/tenants/${tenant.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative w-full h-48 bg-muted flex items-center justify-center">
                    <User className="h-24 w-24 text-muted-foreground" />
                </div>
                <CardHeader>
                    <h3 className="text-lg font-semibold line-clamp-1">
                        {tenant.firstName} {tenant.lastName}
                    </h3>
                    <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{tenant.email}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{tenant.phoneNumber}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex justify-between items-center w-full">
                        <span>{t('view-details')}</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
