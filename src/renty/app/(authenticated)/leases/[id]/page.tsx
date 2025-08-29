import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/prisma/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Home,
  Calendar,
  Euro,
  Users,
  FileText,
  MapPin,
  Settings,
  Trash2,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import EditLeaseModal from "@/features/lease/components/EditLeaseModal"
import DeleteLeaseDialog from "@/features/lease/components/DeleteLeaseDialog"
import ManageTenantsModal from "@/features/lease/components/ManageTenantsModal"
import LeaseDocumentsSection from "@/features/lease/components/LeaseDocumentsSection"
import LeaseRentReceiptSettings from "@/features/lease/components/rent-receipt-settings/LeaseRentReceiptSettings"
import { getLeaseStatusColor, getLeaseTypeColor, formatCurrency, isLeaseExpired, isLeaseExpiringSoon } from "@/features/lease/utils/lease-utils"

async function getLeaseWithDetails(leaseId: string, userId: string) {
  const lease = await prisma.lease.findFirst({
    where: {
      id: leaseId,
      property: {
        userId
      }
    },
    include: {
      property: {
        include: {
          documents: {
            orderBy: {
              uploadedAt: 'desc'
            }
          }
        }
      },
      tenants: {
        include: {
          auth: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  return lease
}

interface LeaseDetailPageProps {
  params: Promise<{ id: string }>
}

async function LeaseDetailContent({ params }: LeaseDetailPageProps) {
  const t = await getTranslations('lease')
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  const { id } = await params

  const lease = await getLeaseWithDetails(id, session.user.id)

  if (!lease) {
    notFound()
  }

  const isExpired = isLeaseExpired(lease.endDate)
  const isExpiringSoon = isLeaseExpiringSoon(lease.endDate)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/leases" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('back-to-leases')}
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {t('lease-title')} - {lease.property.title}
            </h1>
            <Badge className={getLeaseStatusColor(lease.status)}>
              {t(`status.${lease.status.toLowerCase()}`)}
            </Badge>
            <Badge className={getLeaseTypeColor(lease.leaseType)}>
              {t(`type.${lease.leaseType.toLowerCase()}`)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {lease.property.address}, {lease.property.city}
          </p>
        </div>
        <div className="flex gap-2">
          <EditLeaseModal lease={lease}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t('edit')}
            </Button>
          </EditLeaseModal>
          <DeleteLeaseDialog lease={lease}>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              {t('delete.title')}
            </Button>
          </DeleteLeaseDialog>
        </div>
      </div>

      {/* Alert for expiring/expired leases */}
      {isExpired && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{t('expired-lease')}</span>
              <span className="text-sm">
                {t('since')} {format(new Date(lease.endDate!), "dd MMMM yyyy", { locale: fr })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {isExpiringSoon && !isExpired && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{t('expiring-soon')}</span>
              <span className="text-sm">
                {t('on')} {format(new Date(lease.endDate!), "dd MMMM yyyy", { locale: fr })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                {t('property-information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('title-label')}</label>
                  <p className="font-medium">{lease.property.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('full-address')}</label>
                  <p>{lease.property.address}</p>
                  <p>{lease.property.postalCode} {lease.property.city}</p>
                  <p>{lease.property.state}, {lease.property.country}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/properties/${lease.property.id}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {t('view-property')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lease Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('lease-details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dates */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Période
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('start')}</label>
                      <p className="font-medium">
                        {format(new Date(lease.startDate), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('end')}</label>
                      <p className="font-medium">
                        {lease.endDate
                          ? format(new Date(lease.endDate), "dd MMMM yyyy", { locale: fr })
                          : t('indefinite')
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    {t('financial-details')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('rent')}</span>
                      <span className="font-medium">
                        {formatCurrency(lease.rentAmount, lease.currency)}
                        <span className="text-sm text-muted-foreground ml-1">
                          {t('per-month')}
                        </span>
                      </span>
                    </div>

                    {lease.charges && lease.charges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('charges')}</span>
                        <span className="font-medium">
                          {formatCurrency(lease.charges, lease.currency)}
                        </span>
                      </div>
                    )}

                    {lease.depositAmount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('deposit')}</span>
                        <span className="font-medium">
                          {formatCurrency(lease.depositAmount, lease.currency)}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between font-semibold">
                      <span>{t('monthly-total')}</span>
                      <span>
                        {formatCurrency(lease.rentAmount + (lease.charges || 0), lease.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('lease-type')}</label>
                  <p className="font-medium">{t(`type.${lease.leaseType.toLowerCase()}`)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('payment-frequency-label')}</label>
                  <p className="font-medium capitalize">{t(`frequency.${lease.paymentFrequency}`)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('housing')}</label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {lease.isFurnished ? t('furnished-yes') : t('furnished-no')}
                    </p>
                    {lease.isFurnished && (
                      <Badge variant="outline" className="text-xs">
                        {t('furnished')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lease.notes && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('notes')}</label>
                    <p className="mt-1 p-3 bg-muted/50 rounded-md text-sm">
                      {lease.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Documents Section */}
          <LeaseDocumentsSection
            lease={lease}
            documents={lease.property.documents}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tenants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('tenants')} ({lease.tenants.length})
                </CardTitle>
                <ManageTenantsModal lease={lease}>
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </ManageTenantsModal>
              </div>
            </CardHeader>
            <CardContent>
              {lease.tenants.length > 0 ? (
                <div className="space-y-3">
                  {lease.tenants.map((tenant) => (
                    <div key={tenant.id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {tenant.firstName} {tenant.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tenant.email}
                          </p>
                          {tenant.phoneNumber && (
                            <p className="text-xs text-muted-foreground">
                              {tenant.phoneNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          {tenant.auth?.isActivated ? (
                            <Badge variant="default" className="text-xs">
                              {t('activated')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {t('pending')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {tenant.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {tenant.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('no-tenants-assigned')}</p>
                  <ManageTenantsModal lease={lease}>
                    <Button variant="outline" size="sm" className="mt-2">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('assign-tenant')}
                    </Button>
                  </ManageTenantsModal>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('statistics')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('duration')}</span>
                <span className="font-medium">
                  {lease.endDate
                    ? Math.ceil((new Date(lease.endDate).getTime() - new Date(lease.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
                    : "∞"
                  } {t('months')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('annual-revenue')}</span>
                <span className="font-medium">
                  {formatCurrency((lease.rentAmount + (lease.charges || 0)) * 12, lease.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('created-on')}</span>
                <span className="font-medium">
                  {format(new Date(lease.createdAt), "dd/MM/yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Rent Receipt Settings */}
          <LeaseRentReceiptSettings lease={lease} />
        </div>
      </div>
    </div>
  )
}

export default function LeaseDetailPage(props: LeaseDetailPageProps) {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LeaseDetailContent {...props} />
    </Suspense>
  )
}
