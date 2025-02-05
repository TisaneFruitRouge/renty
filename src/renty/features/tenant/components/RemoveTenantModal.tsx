"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { removeTenantFromProperty } from "../actions"
import { useToast } from "@/hooks/use-toast"

interface RemoveTenantModalProps {
  propertyId: string
  tenantId: string
  onSuccess?: () => void
}

export default function RemoveTenantModal({ propertyId, tenantId, onSuccess }: RemoveTenantModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('tenants')
  const router = useRouter()
  const { toast } = useToast()

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await removeTenantFromProperty(propertyId, tenantId)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Trash className="w-4 h-4 mr-1" />
          {t('remove-tenant')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('remove.title')}</DialogTitle>
          <DialogDescription>
            {t('remove.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            {t('remove.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {t('remove.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
