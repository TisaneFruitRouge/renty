import { api } from "@/lib/api";
import { Property, RentReceipt, RentReceiptStatus } from "@/lib/types";

export type RentReceiptWithProperty = RentReceipt & {
    property: Property
};

export async function getTenantRentReceipts(tenantId: string) {
    const response = await api.get(`/api/rent-receipts?
        tenantId=${tenantId}&
        limit=3&
        sortOrder=desc&
        status=${RentReceiptStatus.PAID}
    `);
    return response.data as { rentReceipts: RentReceiptWithProperty[] };
}