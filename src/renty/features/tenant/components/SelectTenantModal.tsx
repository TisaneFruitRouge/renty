"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus } from "lucide-react"
import { SelectTenantForm } from "./SelectTenantForm"
import type { tenant } from "@prisma/client"

interface SelectTenantModalProps {
  propertyId: string
  availableTenants: tenant[];
  onSuccess?: () => void
}

export default function SelectTenantModal({ propertyId, availableTenants, onSuccess }: SelectTenantModalProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('tenants')

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Plus className="w-4 h-4 mr-1" />
          {t('add-tenant')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('select-form.title')}</DialogTitle>
          <DialogDescription>
            {t('select-form.description')}
          </DialogDescription>
        </DialogHeader>
        <SelectTenantForm
          propertyId={propertyId}
          availableTenants={availableTenants}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
