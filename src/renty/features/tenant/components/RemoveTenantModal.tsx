"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { removeTenantFromLeaseAction } from "../actions"
import { useToast } from "@/hooks/use-toast"

interface RemoveTenantModalProps {
  tenantId: string
  onSuccess?: () => void
}

export default function RemoveTenantModal({ tenantId, onSuccess }: RemoveTenantModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('tenants')
  const router = useRouter()
  const { toast } = useToast()

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await removeTenantFromLeaseAction(tenantId)
      toast({
        title: t('remove.success'),
      })
      router.refresh()
      setOpen(false)
      onSuccess?.()
    } catch {
      toast({
        title: t('remove.error'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">
          <Trash className="w-4 h-4 mr-1" />
          {t('remove-tenant')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('remove.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('remove.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('remove.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {t('remove.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
