import { getReceiptById } from "@/features/rent-receipt/db";
import { getTranslations } from "next-intl/server";
import { RentReceiptPreview } from "@/features/rent-receipt/components/RentReceiptPreview";
import { RentReceiptStatusActions } from "@/features/rent-receipt/components/RentReceiptStatusActions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { rentReceiptStatusVariants } from "@/features/rent-receipt/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const t = await getTranslations('rent-receipts');
    const receipt = await getReceiptById(id);

    if (!receipt) {
        throw new Error(t('detail.not-found'));
    }
    
    return (
        <div className="container p-6 space-y-6">
            <div className="mb-4">
                <Link href="/rent-receipts">
                    <Button variant="ghost" className="flex items-center gap-2 pl-0 hover:bg-transparent">
                        <ArrowLeft size={16} />
                        <span>{t('back-to-list')}</span>
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    {receipt.property.title} - {receipt.tenant.firstName} {receipt.tenant.lastName}
                </h1>
                <div className="flex items-center gap-4">
                    <RentReceiptStatusActions
                        receiptId={receipt.id}
                        currentStatus={receipt.status}
                    />
                    <Badge className={cn(
                        rentReceiptStatusVariants[receipt.status],
                        "font-medium shadow-none"
                    )}>
                        {t('status.' + receipt.status)}
                    </Badge>
                </div>
            </div>
            <Card className="p-6">
                <RentReceiptPreview receipt={receipt} />
            </Card>
        </div>
    )
}