import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/prisma/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import EditTenantModal from "@/features/tenant/components/EditTenantModal"

interface TenantPageProps {
    params: Promise<{ id: string }>
}

async function getTenantById(id: string) {
    return prisma.tenant.findUnique({
        where: { id },
        include: {
            property: true
        }
    });
}

export default async function TenantPage({ params }: TenantPageProps) {
    const t = await getTranslations('tenant');
    
    let tenant;
    const { id } = await params;
    try {
        tenant = await getTenantById(id);
    } catch {
        notFound();
    }

    if (!tenant) {
        notFound();
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <Link href="/tenants">
                    <Button variant="ghost">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        {t("back-to-tenants")}
                    </Button>
                </Link>
                <EditTenantModal tenant={tenant} />
            </div>
            <div className="flex flex-col gap-4">
                {/* Personal Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("personal-info.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">{t("personal-info.name")}</dt>
                                <dd className="mt-1 text-sm text-gray-900">{tenant.firstName} {tenant.lastName}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">{t("personal-info.email")}</dt>
                                <dd className="mt-1 text-sm text-gray-900">{tenant.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">{t("personal-info.phone")}</dt>
                                <dd className="mt-1 text-sm text-gray-900">{tenant.phoneNumber}</dd>
                            </div>
                            {tenant.notes && (
                                <div className="col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">{t("personal-info.notes")}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{tenant.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                {/* Property Information Card */}
                {tenant.property && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("property-info.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">{t("property-info.property")}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <Link 
                                            href={`/property/${tenant.propertyId}`}
                                            className="text-primary hover:underline"
                                        >
                                            {tenant.property.title}
                                        </Link>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t("property-info.address")}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {tenant.property.address}, {tenant.property.city}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t("property-info.location")}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {tenant.property.postalCode} {tenant.property.state}, {tenant.property.country}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                )}

                {/* Rent Information Card */}
                {tenant.property && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("rent-info.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tenant.property.rentDetails && (
                                    <>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t("rent-info.base-rent")}</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: tenant.property.currency || 'EUR'
                                                }).format((tenant.property.rentDetails as { baseRent: number; charges: number }).baseRent)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">{t("rent-info.charges")}</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: tenant.property.currency || 'EUR'
                                                }).format((tenant.property.rentDetails as { baseRent: number; charges: number }).charges)}
                                            </dd>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">{t("rent-info.payment-frequency.title")}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{t(`rent-info.payment-frequency.${tenant.property.paymentFrequency}`)}</dd>
                                </div>
                                {tenant.property.depositAmount && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t("rent-info.deposit")}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Intl.NumberFormat('fr-FR', {
                                                style: 'currency',
                                                currency: tenant.property.currency || 'EUR'
                                            }).format(tenant.property.depositAmount)}
                                        </dd>
                                    </div>
                                )}
                                {tenant.property.rentedSince && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">{t("rent-info.rented-since")}</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {format(tenant.property.rentedSince, 'PPP', { locale: fr })}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
