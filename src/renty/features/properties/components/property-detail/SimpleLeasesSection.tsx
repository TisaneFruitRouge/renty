"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Users, Euro, Calendar } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import CreateLeaseModal from "@/features/lease/components/CreateLeaseModal"
import { getLeaseStatusColor, getLeaseTypeColor, formatCurrency } from "@/features/lease/utils/lease-utils"
import type { property } from "@prisma/client"

interface SimpleLease {
  id: string
  startDate: string
  endDate: string | null
  rentAmount: number
  charges: number | null
  leaseType: string
  status: string
  isFurnished: boolean
  tenants: {
    id: string
    firstName: string
    lastName: string
    email: string
  }[]
}

interface SimpleLeasesSectionProps {
  leases: SimpleLease[]
  property: property
}

export default function SimpleLeasesSection({ leases, property }: SimpleLeasesSectionProps) {
  const t = useTranslations()

  return (
    <div className="bg-card rounded-md border border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Baux</h2>
            <Badge variant="secondary" className="ml-2">
              {leases.length}
            </Badge>
          </div>

          <CreateLeaseModal properties={[property]} propertyId={property.id} />
        </div>

        {leases.length > 0 ? (
          <div className="space-y-4 mb-6">
            {leases.map((lease) => (
              <Link key={lease.id} href={`/leases/${lease.id}`}>
                <Card className="border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-medium">
                        Bail {lease.leaseType.toLowerCase()}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getLeaseStatusColor(lease.status)}>
                          {lease.status}
                        </Badge>
                        <Badge className={getLeaseTypeColor(lease.leaseType)}>
                          {lease.leaseType}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                <CardContent className="space-y-3">
                  {/* Tenants */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Locataires ({lease.tenants.length})
                      </span>
                    </div>

                    {lease.tenants.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {lease.tenants.map((tenant) => (
                          <div key={tenant.id} className="flex items-center p-2 bg-muted/30 rounded-md">
                            <div>
                              <p className="text-sm font-medium">
                                {tenant.firstName} {tenant.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tenant.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-md text-center">
                        Aucun locataire assigné
                      </p>
                    )}
                  </div>

                  {/* Financial */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      <span className="text-sm font-medium">Loyer</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(lease.rentAmount)}
                      </p>
                      {lease.charges && lease.charges > 0 && (
                        <p className="text-xs text-muted-foreground">
                          + {formatCurrency(lease.charges)} charges
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('property.period')}</span>
                      {lease.isFurnished && (
                        <Badge variant="outline" className="text-xs ml-2">
                          {t('property.furnished')}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Du {new Date(lease.startDate).toLocaleDateString('fr-FR')}</p>
                      <p>
                        {lease.endDate
                          ? `Au ${new Date(lease.endDate).toLocaleDateString('fr-FR')}`
                          : 'Durée indéterminée'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Home className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('property.no-lease-title')}</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                {t('property.no-lease-description')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
