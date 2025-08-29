"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { lease } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
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
import { deleteLease } from "../actions"

interface DeleteLeaseDialogProps {
    lease: lease
    children: React.ReactNode
}

export default function DeleteLeaseDialog({ lease, children }: DeleteLeaseDialogProps) {
    const t = useTranslations('lease.delete')
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteLease(lease.id)
            toast({
                title: t('success'),
                description: t('success'),
            })
            setOpen(false)
        } catch (error) {
            console.error('Error deleting lease:', error)
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error'),
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }} 
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isDeleting ? "Suppression..." : t('confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}