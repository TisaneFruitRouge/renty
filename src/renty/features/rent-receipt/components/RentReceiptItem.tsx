'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Download, Eye } from "lucide-react"
import type { property, rentReceipt, tenant } from "@prisma/client"
import { RentReceiptStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MouseEventHandler } from "react"
import { updateRentReceiptStatusAction } from "../actions"
import { rentReceiptStatusVariants } from "../constants"

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

    const handleStatusChange = async (status: RentReceiptStatus) => {
        await updateRentReceiptStatusAction(receipt.id, status);
        router.refresh();
    }

    const availableStatusTransitions: Record<RentReceiptStatus, RentReceiptStatus[]> = {
        DRAFT: [RentReceiptStatus.PENDING, RentReceiptStatus.CANCELLED],
        PENDING: [RentReceiptStatus.PAID, RentReceiptStatus.LATE, RentReceiptStatus.UNPAID, RentReceiptStatus.CANCELLED],
        PAID: [],
        LATE: [RentReceiptStatus.PAID, RentReceiptStatus.UNPAID, RentReceiptStatus.CANCELLED],
        UNPAID: [RentReceiptStatus.PAID, RentReceiptStatus.LATE, RentReceiptStatus.CANCELLED],
        CANCELLED: []
    }
    
    return (
        <Card 
            className={cn(
                "p-4 rounded-none first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 hover:cursor-pointer duration-300",
                className
            )}
            onClick={handleView}
        >
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        {receipt?.createdAt?.toLocaleDateString('fr-FR')}
                    </p>
                    <p className="font-medium">{receipt?.property.title}</p>
                    <p className="text-sm text-muted-foreground">
                        {receipt.tenant.firstName} {receipt.tenant.lastName}
                    </p>
                </div>
                <div>
                    <Badge className={cn(
                        rentReceiptStatusVariants[receipt.status],
                        "font-medium shadow-none"
                    )}>
                        {t('status.' + receipt.status)}
                    </Badge>
                </div>
                <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold">{receipt?.baseRent + receipt?.charges}€</p>
                    {receipt?.blobUrl && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200">
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
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                {t('actions.mark-as')}
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                {availableStatusTransitions[receipt.status].map((status) => (
                                                    <DropdownMenuItem 
                                                        key={status}
                                                        onClick={(e) => {
                                                            handleStatusChange(status)
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <Badge className={cn(
                                                            rentReceiptStatusVariants[status],
                                                            "shadow-none mr-2"
                                                        )}>
                                                            {t('actions.mark-as-' + status.toLowerCase())}
                                                        </Badge>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </>
                                )}
                                
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </Card>
    )
}
