"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Users, MapPin, Euro, UserPlus } from "lucide-react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import type { lease, property, tenant, tenantAuth } from "@prisma/client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import ManageTenantsModal from "./ManageTenantsModal"
import { getLeaseStatusColor, getLeaseTypeColor, formatCurrency, isLeaseExpired, isLeaseExpiringSoon } from "../utils/lease-utils"

type LeaseWithDetails = lease & {
  property: property
  tenants: (tenant & {
    auth: tenantAuth | null
  })[]
}

interface LeaseCardProps {
  lease: LeaseWithDetails
}

export default function LeaseCard({ lease }: LeaseCardProps) {
  const t = useTranslations('lease')

  const isExpired = isLeaseExpired(lease.endDate)
  const isExpiringSoon = isLeaseExpiringSoon(lease.endDate)

  return (
    <Link href={`/leases/${lease.id}`}>
      <Card className={cn(
        "hover:shadow-md transition-shadow cursor-pointer",
        isExpired && "border-red-200 dark:border-red-800",
        isExpiringSoon && !isExpired && "border-yellow-200 dark:border-yellow-800"
      )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              <div className="hover:underline flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {lease.property.title}
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {lease.property.address}, {lease.property.city}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={getLeaseStatusColor(lease.status)}>
              {t(`status.${lease.status.toLowerCase()}`)}
            </Badge>
            <Badge className={getLeaseTypeColor(lease.leaseType)}>
              {t(`type.${lease.leaseType.toLowerCase()}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tenants Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('tenants')} ({lease.tenants.length})
              </span>
            </div>
            <ManageTenantsModal lease={lease}>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </ManageTenantsModal>
          </div>

          {lease.tenants.length > 0 ? (
            <div className="space-y-2">
              {lease.tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <div>
                    <p className="text-sm font-medium">
                      {tenant.firstName} {tenant.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tenant.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {tenant.auth?.isActivated ? (
                      <Badge variant="secondary" className="text-xs">
                        {t('activated')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {t('pending')}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md text-center">
              {t('no-tenants-assigned')}
            </p>
          )}
        </div>

        <Separator />

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Euro className="h-4 w-4" />
              <span className="text-sm font-medium">{t('rent')}</span>
            </div>
            <p className="text-lg font-semibold">
              {formatCurrency(lease.rentAmount, lease.currency)}
              <span className="text-sm text-muted-foreground font-normal">
                /{t(`frequency.${lease.paymentFrequency}`)}
              </span>
            </p>
            {lease.charges && lease.charges > 0 && (
              <p className="text-sm text-muted-foreground">
                + {formatCurrency(lease.charges, lease.currency)} {t('charges')}
              </p>
            )}
          </div>

          {lease.depositAmount && (
            <div>
              <span className="text-sm font-medium">{t('deposit')}</span>
              <p className="text-lg font-semibold">
                {formatCurrency(lease.depositAmount, lease.currency)}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Dates and Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{t('period')}</span>
            </div>
            {lease.isFurnished && (
              <Badge variant="outline" className="text-xs">
                {t('furnished')}
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              {t('start')}: {format(new Date(lease.startDate), "dd/MM/yyyy")}
            </p>
            {lease.endDate ? (
              <p className={cn(
                isExpired && "text-red-600 font-medium",
                isExpiringSoon && !isExpired && "text-yellow-600 font-medium"
              )}>
                {t('end')}: {format(new Date(lease.endDate), "dd/MM/yyyy")}
                {isExpired && ` (${t('expired')})`}
                {isExpiringSoon && !isExpired && ` (${t('expires-soon')})`}
              </p>
            ) : (
              <p>{t('end')}: {t('indefinite')}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {lease.notes && (
          <>
            <Separator />
            <div>
              <span className="text-sm font-medium">{t('notes')}</span>
              <p className="text-sm text-muted-foreground mt-1">{lease.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </Link>
  )
}
