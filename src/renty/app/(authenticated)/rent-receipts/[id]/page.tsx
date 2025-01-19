import { getReceiptById } from "@/features/rent-receipt/db";
import { getTranslations } from "next-intl/server";
import { RentReceiptPreview } from "@/features/rent-receipt/components/RentReceiptPreview";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { rentReceiptStatusVariants } from "@/features/rent-receipt/constants";

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const t = await getTranslations('rent-receipts');
    const receipt = await getReceiptById(id);

    if (!receipt) {
        throw new Error(t('detail.not-found'));
    }
    
    return (
        <div className="container p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    {receipt.property.title} - {receipt.tenant.firstName} {receipt.tenant.lastName}
                </h1>
                <Badge className={cn(
                    rentReceiptStatusVariants[receipt.status],
                    "font-medium shadow-none"
                )}>
                    {t('status.' + receipt.status)}
                </Badge>
            </div>
            <Card className="p-6">
                <RentReceiptPreview receipt={receipt} />
            </Card>
        </div>
    )
}