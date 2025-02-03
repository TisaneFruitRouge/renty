'use client'

import { property, rentReceipt, tenant } from "@prisma/client";
import { ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { rentReceiptStatusVariants } from "../constants";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface RecentActivityItemProps {
    receipt: rentReceipt & { property: property; tenant: tenant }
    className?: string
}

export function RecentActivityItem({ receipt, className }: RecentActivityItemProps) {
    const t = useTranslations('rent-receipts');
    const router = useRouter();

    const getPaymentText = (status: string) => {
        const statusText = t(`status.${status}`);
        return `Paiement ${statusText.toLowerCase()}`;
    };

    return (
        <div 
            className={cn(
                "first:border-t flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer",
                className
            )}
            onClick={() => router.push(`/rent-receipts/${receipt.id}`)}
        >
            <div className="flex items-center gap-4">
                <div className="text-muted-foreground">
                    <ReceiptText className="h-5 w-5" />
                </div>
                <div>
                    <div className="font-medium text-sm">{receipt.tenant.firstName}</div>
                    <div className="text-sm text-muted-foreground">
                        {getPaymentText(receipt.status)} · {format(new Date(receipt.startDate), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Badge className={cn(
                    rentReceiptStatusVariants[receipt.status],
                    "font-medium shadow-none"
                )}>
                    {t(`status.${receipt.status}`)}
                </Badge>
                <div className="font-medium">
                    {receipt.baseRent + receipt.charges} €
                </div>
            </div>
        </div>
    );
}
