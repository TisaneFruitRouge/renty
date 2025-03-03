import type { property, tenant } from "@prisma/client"
import { Building2, Mail, Phone, Users, ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import EditTenantModal from "@/features/tenant/components/EditTenantModal"
import DeleteTenantModal from "@/features/tenant/components/DeleteTenantModal"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CreateTenantModal from "@/features/tenant/components/CreateTenantModal"

interface TenantsListProps {
  tenants: (tenant & { property: property | null })[]
  properties: property[]
}

export default async function TenantsList({ tenants, properties }: TenantsListProps) {
  const t = await getTranslations('tenants')
  const isEmpty = tenants.length === 0

  return (
    <div className="relative">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-6 mt-12 bg-muted/20 border border-border rounded-xl p-12 text-center">
          <div className="bg-background p-4 rounded-full shadow-sm border border-border">
            <Users className="h-16 w-16 text-primary" />
          </div>
          
          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-semibold">{t("no-tenants-found")}</h2>
            <p className="text-muted-foreground">
              {t("empty-state-description")}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <CreateTenantModal properties={properties} />
            
            <Link href="/properties">
              <Button variant="outline" className="gap-2 w-full">
                {t("manage-properties")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table-tenant")}</TableHead>
                <TableHead>{t("table-contact")}</TableHead>
                <TableHead>{t("table-property")}</TableHead>
                <TableHead>{t("table-notes")}</TableHead>
                <TableHead className="text-right">{t("table-actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium">{tenant.firstName} {tenant.lastName}</div>
                        {(tenant.startDate && tenant.startDate.getTime() !== 0) && (
                          <div className="text-sm text-muted-foreground">
                            {tenant.startDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{tenant.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{tenant.phoneNumber || "N/A"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tenant.property ? (
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-muted-foreground mr-2" />
                        <div>
                          <div className="font-medium">{tenant.property.title}</div>
                          <div className="text-sm text-muted-foreground">{tenant.property.address}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">{t("no-property")}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground max-w-xs truncate">
                      {tenant.notes || t("no-notes")}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <EditTenantModal properties={properties} tenant={tenant} />
                      <DeleteTenantModal tenant={tenant} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
