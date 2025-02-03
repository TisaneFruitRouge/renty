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
import { Edit } from "lucide-react"
import type { property, tenant } from "@prisma/client"
import EditTenantForm from "./EditTenantForm"

interface EditTenantModalProps {
  tenant: tenant;
  properties: property[]
}

export default function EditTenantModal({ tenant, properties }: EditTenantModalProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('tenant')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('edit-form.title')}</DialogTitle>
          <DialogDescription>
            {t('edit-form.description')}
          </DialogDescription>
        </DialogHeader>
        <EditTenantForm 
          tenant={tenant}
          properties={properties}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
