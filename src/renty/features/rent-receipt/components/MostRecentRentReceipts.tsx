import { property, rentReceipt, tenant } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RecentActivityItem } from "./RecentActivityItem";
import { useTranslations } from "next-intl";

interface MostRecentRentReceiptsProps {
    receipts: Array<rentReceipt & { property: property; tenant: tenant }>
}

export default function MostRecentRentReceipts({ receipts }: MostRecentRentReceiptsProps) {
    const t = useTranslations('home');
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-xl">{t('recent-activity')}</CardTitle>
                <Link href="/rent-receipts">
                    <Button>{t('see-more')}</Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y">
                {receipts.map((receipt) => (
                    <RecentActivityItem 
                        key={receipt.id} 
                        receipt={receipt}
                    />
                ))}
            </CardContent>
        </Card>
    ); 
}