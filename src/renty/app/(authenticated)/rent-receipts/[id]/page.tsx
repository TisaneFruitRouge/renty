import { getReceiptById } from "@/features/rent-receipt/db";
import { getTranslations } from "next-intl/server";
import { PageTitle } from "@/components/ui/typography";
import { RentReceiptPreview } from "@/features/rent-receipt/components/RentReceiptPreview";
import { RentReceiptStatusActions } from "@/features/rent-receipt/components/RentReceiptStatusActions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { rentReceiptStatusVariants } from "@/features/rent-receipt/constants";
import { ArrowLeft, ChevronRight } from "lucide-react";
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
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/rent-receipts" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('back-to-list')}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-foreground font-medium truncate">
                    {receipt.property.title} – {receipt.tenant.firstName} {receipt.tenant.lastName}
                </span>
            </nav>
            <div className="flex items-center justify-between">
                <PageTitle>
                    {receipt.property.title} - {receipt.tenant.firstName} {receipt.tenant.lastName}
                </PageTitle>
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