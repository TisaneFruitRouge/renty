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
import type { property } from "@/lib/types"
import { EditPropertyForm } from "./EditPropertyForm"

interface EditPropertyModalProps {
  property: property
  onSuccess?: () => void
}

export default function EditPropertyModal({ property, onSuccess }: EditPropertyModalProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('property')

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center" variant="outline">
          <Pencil className="w-4 h-4 mr-2" />
          {t("edit-property")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('edit-form.title')}</DialogTitle>
          <DialogDescription>
            {t('edit-form.description')}
          </DialogDescription>
        </DialogHeader>
        <EditPropertyForm
          property={property}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
