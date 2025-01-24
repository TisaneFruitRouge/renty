"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { deleteTenantFromProperty, getTenantByPropertyId } from "../actions"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"

interface TenantCardProps {
  tenant: Awaited<ReturnType<typeof getTenantByPropertyId>>
}

export default function TenantCard({ tenant }: TenantCardProps) {
  const { toast } = useToast()
  const t = useTranslations('tenant.card')

  async function handleDelete() {
    try {
      await deleteTenantFromProperty(tenant.id as string)
      toast({
        title: "Success",
        description: t('success.removed'),
      })
    } catch (error) {
      console.error("Delete error", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: t('error.remove'),
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tenant.firstName} {tenant.lastName}</CardTitle>
        <CardDescription>{t('title')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-medium">{t('email')}:</span> {tenant.email}
        </div>
        <div>
          <span className="font-medium">{t('phone')}:</span> {tenant.phoneNumber}
        </div>
        {tenant.notes && (
          <div>
            <span className="font-medium">{t('notes')}:</span>
            <p className="text-sm text-gray-500 mt-1">{tenant.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          onClick={handleDelete}
          className="w-full"
        >
          {t('remove-button')}
        </Button>
      </CardFooter>
    </Card>
  )
}
