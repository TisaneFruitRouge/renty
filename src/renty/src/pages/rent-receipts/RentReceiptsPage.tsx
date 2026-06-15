import { useMemo } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "@/lib/navigation";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { PageTitle } from "@/components/ui/typography";
import type { property, rentReceipt, tenant } from "@/lib/types";
import { reviveDates } from "../../lib/revive-dates";
import { useCurrentUserId } from "../../lib/current-user";
import CreateRentReceiptModal from "./CreateRentReceiptModal";
import { RentReceiptFilters } from "./RentReceiptFilters";
import RentReceiptsList from "./RentReceiptsList";

type ReceiptWithDetails = rentReceipt & { property: property | null; tenant: tenant | null };

export function RentReceiptsPage() {
  const t = useTranslations("rent-receipts");
  const searchParams = useSearchParams();
  const userId = useCurrentUserId();
  const rawReceipts = useQuery(api.rentReceipts.listForUser, userId ? { userId } : "skip");
  const rawProperties = useQuery(api.properties.listForUser, userId ? { userId } : "skip");

  const properties = useMemo(
    () => reviveDates(rawProperties ?? []) as unknown as property[],
    [rawProperties],
  );

  const receipts = useMemo(() => {
    let result = reviveDates(rawReceipts ?? []) as unknown as ReceiptWithDetails[];
    const propertyId = searchParams.get("propertyId");
    const receiptStatus = searchParams.get("receiptStatus");

    if (propertyId && propertyId !== "all") {
      result = result.filter((receipt) => receipt.propertyId === propertyId);
    }

    if (receiptStatus && receiptStatus !== "all") {
      result = result.filter((receipt) => receipt.status === receiptStatus);
    }

    return result;
  }, [rawReceipts, searchParams]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <PageTitle>{t("title")}</PageTitle>
        <CreateRentReceiptModal properties={properties} />
      </div>

      <RentReceiptFilters properties={properties} />

      <RentReceiptsList receipts={receipts} properties={properties} />
    </div>
  );
}
