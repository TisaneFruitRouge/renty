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
import CreateTenantForm from "./CreateTenantForm"
import { Plus } from "lucide-react"
import type { property } from "@prisma/client"

interface CreateTenantModalProps {
  properties: property[]
}

export default function CreateTenantModal({properties}: CreateTenantModalProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('tenants')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('add-tenant')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create-form.title')}</DialogTitle>
          <DialogDescription>
            {t('create-form.description')}
          </DialogDescription>
        </DialogHeader>
        <CreateTenantForm
          properties={properties} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}
