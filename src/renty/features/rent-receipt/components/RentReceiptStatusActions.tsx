'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Send } from "lucide-react"
import { RentReceiptStatus } from "@prisma/client"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { rentReceiptStatusVariants } from "../constants"
import { updateRentReceiptStatusAction, sendRentReceiptAction } from "../actions"
import { useToast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface RentReceiptStatusActionsProps {
    receiptId: string
    currentStatus: RentReceiptStatus
}

export const availableStatusTransitions: Record<RentReceiptStatus, RentReceiptStatus[]> = {
    DRAFT: [RentReceiptStatus.PENDING, RentReceiptStatus.CANCELLED],
    PENDING: [RentReceiptStatus.PAID, RentReceiptStatus.LATE, RentReceiptStatus.UNPAID, RentReceiptStatus.CANCELLED],
    PAID: [],
    LATE: [RentReceiptStatus.PAID, RentReceiptStatus.UNPAID, RentReceiptStatus.CANCELLED],
    UNPAID: [RentReceiptStatus.PAID, RentReceiptStatus.LATE, RentReceiptStatus.CANCELLED],
    CANCELLED: []
}

export function RentReceiptStatusActions({ receiptId, currentStatus }: RentReceiptStatusActionsProps) {
    const t = useTranslations('rent-receipts')
    const { toast } = useToast();
    const router = useRouter();

    const handleStatusChange = async (e: React.MouseEvent, status: RentReceiptStatus) => {
        
        // Necessary otherwise, for some reason, the clicks don't get 
        // registered on the rest of the page unless we refresh it
        e.stopPropagation();
        
        try {
            await updateRentReceiptStatusAction(receiptId, status)
            toast({
                title: t('status-update.success'),
                description: t('status-update.success-description'),
            });
            router.refresh();
        } catch {
            toast({
                title: t('status-update.error'),
                description: t('status-update.error-description'),
                variant: 'destructive',
            });
        }
    }

    const handleSend = async () => {
        try {
            await sendRentReceiptAction(receiptId)
            toast({
                title: t('send.success'),
                description: t('send.success-description'),
            })
            router.refresh();
        } catch {
            toast({
                title: t('send.error'),
                description: t('send.error-description'),
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="flex items-center gap-2">
            {status === RentReceiptStatus.PENDING && (
                <Button
                    size="sm"
                    onClick={handleSend}
                >
                    <Send className="h-4 w-4 mr-2" />
                    {t('actions.send')}
                </Button>
            )}
            
            {availableStatusTransitions[currentStatus].length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4 mr-2" />
                            {t('actions.mark-as')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {availableStatusTransitions[currentStatus].map((status) => (
                            <DropdownMenuItem 
                                key={status}
                                onClick={(e) => handleStatusChange(e, status)}
                            >
                                <Badge className={cn(
                                    rentReceiptStatusVariants[status],
                                    "shadow-none mr-2"
                                )}>
                                    {t('actions.mark-as-' + status.toLowerCase())}
                                </Badge>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}
