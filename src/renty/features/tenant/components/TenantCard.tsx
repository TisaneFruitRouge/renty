import { useTranslations } from "next-intl"
import { Users } from "lucide-react"
import type { tenant } from "@prisma/client"

interface TenantCardProps {
  tenant: tenant;
}

export default function TenantCard({ tenant }: TenantCardProps) {
  const t = useTranslations('tenant')

  return (
    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-solid border-primary/10">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          <Users className="h-5 w-5 text-gray-500" />
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium">
            {tenant.firstName} {tenant.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {tenant.email} • {tenant.phoneNumber}
          </div>
        </div>
      </div>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {t('status.up_to_date')}
      </span>
    </div>
  )
}
