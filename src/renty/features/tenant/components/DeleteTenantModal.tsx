"use client"

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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('delete.title')}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete.description', { name: `${tenant.firstName} ${tenant.lastName}` })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('delete.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {t('delete.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
