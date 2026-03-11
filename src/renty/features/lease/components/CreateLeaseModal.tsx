"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { property } from "@prisma/client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CreateLeaseWizard from "./wizard/CreateLeaseWizard"

interface CreateLeaseModalProps {
    properties: property[]
    propertyId?: string
}

export default function CreateLeaseModal({ properties, propertyId }: CreateLeaseModalProps) {
    const t = useTranslations("lease.create-form")
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setTimeout(() => { document.body.style.pointerEvents = "" }, 0)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("open-title")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("open-title")}</DialogTitle>
                </DialogHeader>
                <CreateLeaseWizard
                    properties={properties}
                    propertyId={propertyId}
                    onSuccess={() => setIsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
