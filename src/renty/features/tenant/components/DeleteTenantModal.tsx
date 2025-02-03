"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Trash2 } from "lucide-react"
import type { tenant } from "@prisma/client"
import { toast } from "@/hooks/use-toast"
import { deleteTenant } from "../actions"
import { useRouter } from "next/navigation"

interface DeleteTenantModalProps {
  tenant: tenant;
}

export default function DeleteTenantModal({ tenant }: DeleteTenantModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('tenant')
  const router = useRouter()

  async function handleDelete() {
    try {
      setLoading(true)
      await deleteTenant(tenant.id)
      
      toast({
        title: t('delete.success'),
      })
      
      router.refresh()
      setOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        title: t('delete.error'),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('delete.title')}</DialogTitle>
          <DialogDescription>
            {t('delete.description', { name: `${tenant.firstName} ${tenant.lastName}` })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {t('delete.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {t('delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
