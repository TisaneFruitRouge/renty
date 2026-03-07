'use client'

import { Button } from "@/components/ui/button"
import { MoreHorizontal, Download, Eye } from "lucide-react"
import type { property, rentReceipt, tenant } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MouseEventHandler } from "react"
import { rentReceiptStatusVariants } from "../constants"
import { RentReceiptStatusActions, availableStatusTransitions } from "./RentReceiptStatusActions"

interface RentReceiptItemProps {
    receipt: rentReceipt & { property: property; tenant: tenant }
    className?: string
}

export function RentReceiptItem({ receipt, className }: RentReceiptItemProps) {
    
    const router = useRouter();
    const t = useTranslations('rent-receipts');
    
    const handleView: MouseEventHandler<HTMLDivElement> = async () => {
        router.push(`/rent-receipts/${receipt.id}`)
    }
    
    const handleDownload: MouseEventHandler<HTMLDivElement> = async (e) => {
        // this prevent from triggering the click event on the card
        // which would reidrect the user on the receipt details page
        e.stopPropagation();

        if (receipt.blobUrl) {
            window.open(receipt.blobUrl, '_blank');
        }
        return;
    }

    return (
        <div
            className={cn(
                "flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors",
                className
            )}
            onClick={handleView}
        >
            {/* Left: date + property + tenant */}
            <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs text-muted-foreground tabular-nums">
                    {receipt?.createdAt?.toLocaleDateString('fr-FR')}
                </p>
                <p className="font-medium text-sm truncate">{receipt?.property.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                    {receipt.tenant.firstName} {receipt.tenant.lastName}
                </p>
            </div>

            {/* Center: status badge */}
            <div className="shrink-0 mx-4">
                <Badge className={cn(rentReceiptStatusVariants[receipt.status], "font-medium")}>
                    {t('status.' + receipt.status)}
                </Badge>
            </div>

            {/* Right: amount + actions */}
            <div className="flex items-center gap-2 shrink-0">
                <p className="text-sm font-semibold tabular-nums w-20 text-right">
                    {(receipt?.baseRent + receipt?.charges).toLocaleString('fr-FR')}€
                </p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t('actions.more')}>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleView}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('actions.view')}
                        </DropdownMenuItem>
                        {receipt.blobUrl && (
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('actions.download')}
                            </DropdownMenuItem>
                        )}
                        {availableStatusTransitions[receipt.status].length > 0 && (
                            <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                                <div className="w-full">
                                    <RentReceiptStatusActions
                                        receiptId={receipt.id}
                                        currentStatus={receipt.status}
                                    />
                                </div>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
