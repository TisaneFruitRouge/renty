"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { lease } from "@prisma/client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import EditLeaseForm from "./EditLeaseForm"

interface EditLeaseModalProps {
    lease: lease
    children: React.ReactNode
}

export default function EditLeaseModal({ lease, children }: EditLeaseModalProps) {
    const t = useTranslations('lease.edit-form')
    const [isOpen, setIsOpen] = useState(false)

    const handleSuccess = () => {
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                </DialogHeader>
                <EditLeaseForm 
                    lease={lease}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    )
}