"use client"

import TenantCard from "./TenantCard"
import SelectTenantModal from "./SelectTenantModal"
import RemoveTenantModal from "./RemoveTenantModal"
import type { tenant } from "@prisma/client"

interface TenantSectionProps {
  propertyId: string
  initialTenant?: tenant
  availableTenants: tenant[]
}

export default function TenantSection({ propertyId, initialTenant, availableTenants }: TenantSectionProps) {
  if (initialTenant) {
    return (
      <div className="space-y-4">
        <TenantCard tenant={initialTenant} />
        <div className="flex justify-end">
          <RemoveTenantModal
            propertyId={propertyId}
            tenantId={initialTenant.id}
          />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex justify-end">
      <SelectTenantModal availableTenants={availableTenants} propertyId={propertyId} />
    </div>
  )
}
