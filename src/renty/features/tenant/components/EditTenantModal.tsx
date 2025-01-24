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
import { Pencil } from "lucide-react"
import type { tenant } from "@prisma/client"
import EditTenantForm from "./EditTenantForm"

interface EditTenantModalProps {
  tenant: tenant;
}

export default function EditTenantModal({ tenant }: EditTenantModalProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('tenant')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          {t('edit')}
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
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
