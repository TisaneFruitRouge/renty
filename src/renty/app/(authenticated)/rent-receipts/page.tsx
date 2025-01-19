import { getTranslations } from "next-intl/server"
import { RentReceiptItem } from "@/features/rent-receipt/components/RentReceiptItem";
import { getReceiptsOfUser } from "@/features/rent-receipt/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CreateRentReceiptModal from "@/features/rent-receipt/components/CreateRentReceiptModal";
import { getPropertiesForUser } from "@/features/properties/db";

export default async function RentReceiptsPage() {
    const t = await getTranslations('rent-receipts');

    const data = await auth.api.getSession({
        headers: await headers()
    })

    if (!data?.user) {
        throw new Error("Not authenticated");
    }
    
    const receipts = await getReceiptsOfUser(data.user.id)
    const properties = await getPropertiesForUser(data.user.id);

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-3xl font-semibold mb-4">{t('title')}</h1>
                <CreateRentReceiptModal properties={properties} />
            </div>
            
            <div>
                {receipts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        {t('no-receipts')}
                    </p>
                ) : (
                    receipts.map((receipt, index) => (
                        <RentReceiptItem
                            key={index}
                            receipt={receipt}
                        />
                    ))
                )}
            </div>
        </div>
    )
}