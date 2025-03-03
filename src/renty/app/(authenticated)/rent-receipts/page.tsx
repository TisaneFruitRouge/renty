import { getTranslations } from "next-intl/server"
import { getReceiptsOfUser } from "@/features/rent-receipt/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CreateRentReceiptModal from "@/features/rent-receipt/components/CreateRentReceiptModal";
import { getPropertiesForUser } from "@/features/properties/db";
import { RentReceiptFilters } from "@/features/rent-receipt/components/RentReceiptFilters";
import RentReceiptsList from "@/features/rent-receipt/components/RentReceiptsList";

interface RentReceiptsPageSearchParams {
    searchParams: Promise<{ 
        propertyId: string;
        receiptStatus: string;
    }>
}

export default async function RentReceiptsPage({ searchParams }: RentReceiptsPageSearchParams) {
    const t = await getTranslations('rent-receipts');

    const { propertyId, receiptStatus } = await searchParams;

    const data = await auth.api.getSession({
        headers: await headers()
    })

    if (!data?.user) {
        throw new Error("Not authenticated");
    }
    
    let receipts = await getReceiptsOfUser(data.user.id)
    const properties = await getPropertiesForUser(data.user.id);

    if (propertyId && propertyId !== "all") {
        receipts = receipts.filter(receipt => receipt.propertyId === propertyId)
    }

    if (receiptStatus && receiptStatus !== "all") {
        receipts = receipts.filter(receipt => receipt.status === receiptStatus)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-3xl font-semibold mb-4">{t('title')}</h1>
                <CreateRentReceiptModal properties={properties} />
            </div>
            
            <RentReceiptFilters properties={properties} />
            
            <RentReceiptsList receipts={receipts} properties={properties} />
        </div>
    )
}