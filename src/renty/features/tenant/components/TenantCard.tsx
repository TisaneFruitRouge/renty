import { useTranslations } from "next-intl"
import { Users } from "lucide-react"
import type { tenant } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface TenantCardProps {
  tenant: tenant;
}

export default function TenantCard({ tenant }: TenantCardProps) {
  const t = useTranslations('tenant')

  return (
    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-center min-w-0">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="ml-4 min-w-0">
          <div className="text-sm font-medium truncate">
            {tenant.firstName} {tenant.lastName}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {tenant.email}{tenant.phoneNumber ? ` • ${tenant.phoneNumber}` : ''}
          </div>
        </div>
      </div>
      <Badge className="bg-success-muted text-success-foreground hover:bg-success-muted">
        {t('status.up_to_date')}
      </Badge>
    </div>
  )
}
