"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users, Euro, Calendar, Home } from "lucide-react"

import CreateLeaseForm from "@/features/lease/components/CreateLeaseForm"
import LeaseCard from "@/features/lease/components/LeaseCard"
import type { lease, property, tenant, tenantAuth } from "@prisma/client"

type LeaseWithDetails = lease & {
  property: property
  tenants: (tenant & {
    auth: tenantAuth | null
  })[]
}

interface LeasesSectionProps {
  propertyId: string
  leases: LeaseWithDetails[]
}

export default function LeasesSection({ propertyId, leases }: LeasesSectionProps) {
  const t = useTranslations('property')
  const [isCreateLeaseOpen, setIsCreateLeaseOpen] = useState(false)

  const handleCreateLeaseSuccess = () => {
    setIsCreateLeaseOpen(false)
  }

  return (
    <div className="bg-card rounded-md border border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t("leases")}</h2>
            <Badge variant="secondary" className="ml-2">
              {leases.length}
            </Badge>
          </div>

          <Dialog open={isCreateLeaseOpen} onOpenChange={setIsCreateLeaseOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t("create-lease")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("create-new-lease")}</DialogTitle>
              </DialogHeader>
              <CreateLeaseForm
                propertyId={propertyId}
                properties={[]} // We already know the property
                onSuccess={handleCreateLeaseSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        {leases.length > 0 ? (
          <div className="space-y-4">
            {leases.map((lease) => (
              <LeaseCard
                key={lease.id}
                lease={lease}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Home className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("no-leases")}</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                {t("no-leases-description")}
              </p>
              <Dialog open={isCreateLeaseOpen} onOpenChange={setIsCreateLeaseOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("create-first-lease")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("create-new-lease")}</DialogTitle>
                  </DialogHeader>
                  <CreateLeaseForm
                    propertyId={propertyId}
                    properties={[]} // We already know the property
                    onSuccess={handleCreateLeaseSuccess}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {leases.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{t("total-tenants")}</span>
                </div>
                <p className="text-2xl font-bold">
                  {leases.reduce((acc, lease) => acc + lease.tenants.length, 0)}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Euro className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{t("total-rent")}</span>
                </div>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: leases[0]?.currency || 'EUR',
                  }).format(
                    leases.reduce((acc, lease) => acc + lease.rentAmount + (lease.charges || 0), 0)
                  )}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{t("active-leases")}</span>
                </div>
                <p className="text-2xl font-bold">
                  {leases.filter(lease => lease.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
