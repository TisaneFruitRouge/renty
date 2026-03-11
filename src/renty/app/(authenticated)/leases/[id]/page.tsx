import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/prisma/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Home,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  MapPin,
  Settings,
  Trash2,
  UserPlus,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Clock,
  CreditCard,
  Wallet,
  StickyNote,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"
import EditLeaseModal from "@/features/lease/components/EditLeaseModal"
import DeleteLeaseDialog from "@/features/lease/components/DeleteLeaseDialog"
import EndLeaseModal from "@/features/lease/components/EndLeaseModal"
import RenewLeaseModal from "@/features/lease/components/RenewLeaseModal"
import ManageTenantsModal from "@/features/lease/components/ManageTenantsModal"
import LeaseDocumentsSection from "@/features/lease/components/LeaseDocumentsSection"
import LeaseRentReceiptSettings from "@/features/lease/components/rent-receipt-settings/LeaseRentReceiptSettings"
import {
  getLeaseStatusColor,
  getLeaseTypeColor,
  formatCurrency,
  isLeaseExpired,
  isLeaseExpiringSoon,
  getLeaseDurationInMonths,
  getTotalMonthlyRent,
  getAnnualRevenue,
} from "@/features/lease/utils/lease-utils"

async function getLeaseWithDetails(leaseId: string, userId: string) {
  return prisma.lease.findFirst({
    where: {
      id: leaseId,
      property: { userId },
    },
    include: {
      property: {
        include: {
          documents: { orderBy: { uploadedAt: "desc" } },
        },
      },
      tenants: {
        include: { auth: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

interface LeaseDetailPageProps {
  params: Promise<{ id: string }>
}

function TenantAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  return (
    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-primary uppercase">
        {firstName[0]}{lastName[0]}
      </span>
    </div>
  )
}

function StatChip({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

async function LeaseDetailContent({ params }: LeaseDetailPageProps) {
  const t = await getTranslations("lease")
  const session = await getSession()

  if (!session?.user?.id) redirect("/sign-in")

  const { id } = await params
  const lease = await getLeaseWithDetails(id, session.user.id)
  if (!lease) notFound()

  const isExpired = isLeaseExpired(lease.endDate)
  const isExpiringSoon = isLeaseExpiringSoon(lease.endDate)
  const monthlyTotal = getTotalMonthlyRent(lease.rentAmount, lease.charges)
  const annualRevenue = getAnnualRevenue(lease.rentAmount, lease.charges)
  const durationMonths = getLeaseDurationInMonths(lease.startDate, lease.endDate)
  const daysUntilEnd = lease.endDate ? differenceInDays(new Date(lease.endDate), new Date()) : null

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 space-y-6 max-w-7xl">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/leases" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back-to-leases")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-foreground font-medium truncate">{lease.property.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("lease-title")}</h1>
            <Badge className={getLeaseStatusColor(lease.status)}>
              {t(`status.${lease.status.toLowerCase()}`)}
            </Badge>
            <Badge className={getLeaseTypeColor(lease.leaseType)}>
              {t(`type.${lease.leaseType.toLowerCase()}`)}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Home className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{lease.property.title}</span>
            <span className="opacity-40">·</span>
            <span>{lease.property.city}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <EditLeaseModal lease={lease}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1.5" />
              {t("edit")}
            </Button>
          </EditLeaseModal>
          {(lease.status === "ACTIVE" || lease.status === "PENDING") && (
            <EndLeaseModal lease={lease}>
              <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-800 dark:hover:bg-orange-900/20">
                <XCircle className="h-4 w-4 mr-1.5" />
                {t("end-lease.trigger")}
              </Button>
            </EndLeaseModal>
          )}
          {(lease.status === "ACTIVE" || lease.status === "EXPIRED" || lease.status === "TERMINATED") && (
            <RenewLeaseModal lease={lease}>
              <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20">
                <RefreshCw className="h-4 w-4 mr-1.5" />
                {t("renew-lease.trigger")}
              </Button>
            </RenewLeaseModal>
          )}
          <DeleteLeaseDialog lease={lease}>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20">
              <Trash2 className="h-4 w-4 mr-1.5" />
              {t("delete.title")}
            </Button>
          </DeleteLeaseDialog>
        </div>
      </div>

      {/* Alert banners */}
      {isExpired && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/10 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <div className="flex flex-wrap items-baseline gap-1.5 text-sm">
            <span className="font-semibold">{t("expired-lease")}</span>
            <span className="opacity-80">
              {t("since")} {format(new Date(lease.endDate!), "dd MMMM yyyy", { locale: fr })}
            </span>
          </div>
        </div>
      )}
      {isExpiringSoon && !isExpired && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 dark:border-amber-800 dark:bg-amber-900/10 dark:text-amber-400">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <div className="flex flex-wrap items-baseline gap-1.5 text-sm">
            <span className="font-semibold">{t("expiring-soon")}</span>
            <span className="opacity-80">
              {t("on")} {format(new Date(lease.endDate!), "dd MMMM yyyy", { locale: fr })}
              {daysUntilEnd !== null && (
                <span className="ml-1 font-medium">({daysUntilEnd} jours)</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Financial overview */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                {t("financial-details")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Hero rent block */}
              <div className="rounded-xl bg-primary/5 border border-primary/15 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("monthly-total")}</p>
                  <p className="text-3xl font-bold text-primary tracking-tight">
                    {formatCurrency(monthlyTotal, lease.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t("per-month")}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t("annual-revenue")}</p>
                  <p className="text-xl font-bold">{formatCurrency(annualRevenue, lease.currency)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("per-year")}</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("rent")}</p>
                    <p className="font-semibold text-sm">{formatCurrency(lease.rentAmount, lease.currency)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("charges")}</p>
                    <p className="font-semibold text-sm">
                      {lease.charges && lease.charges > 0
                        ? formatCurrency(lease.charges, lease.currency)
                        : <span className="text-muted-foreground font-normal text-sm">—</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                  <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("deposit")}</p>
                    <p className="font-semibold text-sm">
                      {lease.depositAmount
                        ? formatCurrency(lease.depositAmount, lease.currency)
                        : <span className="text-muted-foreground font-normal text-sm">—</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary" className="font-normal text-xs">
                  {t(`frequency.${lease.paymentFrequency}`)}
                </Badge>
                <Badge variant="secondary" className="font-normal text-xs">
                  {lease.currency}
                </Badge>
                {lease.isFurnished && (
                  <Badge variant="secondary" className="font-normal text-xs">
                    {t("furnished")}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lease terms */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {t("lease-details")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                <div className="rounded-lg border bg-muted/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">{t("start")}</p>
                  <p className="font-semibold text-sm">
                    {format(new Date(lease.startDate), "dd MMM yyyy", { locale: fr })}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  {durationMonths !== null ? (
                    <div className="text-center w-full">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        {durationMonths} {t("months")}
                      </p>
                      <div className="h-px w-full bg-border" />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t("indefinite")}</p>
                  )}
                </div>

                <div className="rounded-lg border bg-muted/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">{t("end")}</p>
                  <p className="font-semibold text-sm">
                    {lease.endDate
                      ? format(new Date(lease.endDate), "dd MMM yyyy", { locale: fr })
                      : <span className="text-muted-foreground">∞</span>}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t("lease-type")}</p>
                  <Badge className={`${getLeaseTypeColor(lease.leaseType)} font-normal text-xs`}>
                    {t(`type.${lease.leaseType.toLowerCase()}`)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t("payment-frequency-label")}</p>
                  <p className="text-sm font-medium">{t(`frequency.${lease.paymentFrequency}`)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t("housing")}</p>
                  <p className="text-sm font-medium">
                    {lease.isFurnished ? t("furnished-yes") : t("furnished-no")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">{t("created-on")}</p>
                  <p className="text-sm font-medium">
                    {format(new Date(lease.createdAt), "dd MMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {lease.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <StickyNote className="h-3.5 w-3.5" />
                      {t("notes")}
                    </p>
                    <p className="text-sm bg-muted/30 rounded-lg px-4 py-3 leading-relaxed">
                      {lease.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Property — compact row */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                    <Home className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{lease.property.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lease.property.address}, {lease.property.postalCode} {lease.property.city}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                  <Link href={`/properties/${lease.property.id}`}>
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    {t("view-property")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <LeaseDocumentsSection lease={lease} documents={lease.property.documents} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Tenants */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {t("tenants")}
                  {lease.tenants.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({lease.tenants.length})
                    </span>
                  )}
                </CardTitle>
                <ManageTenantsModal lease={lease}>
                  <Button size="sm" variant="outline" aria-label={t("assign-tenant")}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </ManageTenantsModal>
              </div>
            </CardHeader>
            <CardContent>
              {lease.tenants.length > 0 ? (
                <div className="space-y-4">
                  {lease.tenants.map((tenant, idx) => (
                    <div key={tenant.id}>
                      {idx > 0 && <Separator className="mb-4" />}
                      <div className="flex items-start gap-3">
                        <TenantAvatar firstName={tenant.firstName} lastName={tenant.lastName} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="font-semibold text-sm truncate">
                              {tenant.firstName} {tenant.lastName}
                            </p>
                            {tenant.auth?.isActivated ? (
                              <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 flex-shrink-0">
                                {t("activated")}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {t("pending")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
                          {tenant.phoneNumber && (
                            <p className="text-xs text-muted-foreground">{tenant.phoneNumber}</p>
                          )}
                          {tenant.notes && (
                            <p className="text-xs text-muted-foreground mt-1.5 italic leading-relaxed">
                              {tenant.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("no-tenants-assigned")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("assign-tenant")}</p>
                  </div>
                  <ManageTenantsModal lease={lease}>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t("assign-tenant")}
                    </Button>
                  </ManageTenantsModal>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {t("statistics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <StatChip
                  label={t("duration")}
                  value={durationMonths !== null ? `${durationMonths} ${t("months")}` : "∞"}
                />
                <StatChip
                  label={t("annual-revenue")}
                  value={formatCurrency(annualRevenue, lease.currency)}
                />
                <StatChip
                  label={t("created-on")}
                  value={format(new Date(lease.createdAt), "dd/MM/yyyy")}
                />
                {daysUntilEnd !== null && daysUntilEnd > 0 && (
                  <StatChip
                    label={t("days-remaining")}
                    value={`${daysUntilEnd}j`}
                    sub={format(new Date(lease.endDate!), "dd MMM yyyy", { locale: fr })}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rent receipt settings */}
          <LeaseRentReceiptSettings lease={lease} />
        </div>
      </div>
    </div>
  )
}

export default function LeaseDetailPage(props: LeaseDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6 sm:px-6 space-y-6 max-w-7xl animate-pulse">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-52 bg-muted rounded-xl" />
              <div className="h-60 bg-muted rounded-xl" />
              <div className="h-14 bg-muted rounded-xl" />
            </div>
            <div className="space-y-6">
              <div className="h-52 bg-muted rounded-xl" />
              <div className="h-32 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <LeaseDetailContent {...props} />
    </Suspense>
  )
}
