"use client"

import { TenantSelector } from "@/features/tenant/components/TenantSelector"
import TenantCard from "./TenantCard"
import { getTenantByPropertyId, updateTenantProperty } from "../actions"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface TenantSectionProps {
  propertyId: string
  initialTenant?: Awaited<ReturnType<typeof getTenantByPropertyId>>
}

export default function TenantSection({ propertyId, initialTenant }: TenantSectionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const t = useTranslations('tenant')

  if (initialTenant) {
    return <TenantCard tenant={initialTenant} />
  }

  async function handleSelect(tenantId: string) {
    try {
      await updateTenantProperty(tenantId, propertyId)
      toast({
        title: "Success",
        description: t('success.assigned'),
      })
      router.refresh()
    } catch (error) {
      console.error("Error updating tenant property:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: t('error.assign'),
      })
    }
  }

  return <TenantSelector onSelect={handleSelect} />
}
