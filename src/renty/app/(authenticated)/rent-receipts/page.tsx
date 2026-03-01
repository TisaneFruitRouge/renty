import { getTranslations } from "next-intl/server"
import { getReceiptsOfUser } from "@/features/rent-receipt/db";
import { getSession } from "@/lib/session";
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

    const data = await getSession()

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
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <CreateRentReceiptModal properties={properties} />
            </div>
            
            <RentReceiptFilters properties={properties} />
            
            <RentReceiptsList receipts={receipts} properties={properties} />
        </div>
    )
}