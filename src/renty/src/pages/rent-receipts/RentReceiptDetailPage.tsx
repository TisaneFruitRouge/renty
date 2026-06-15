import { useMemo } from "react";
import { useQuery } from "convex/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslations } from "@/lib/i18n";
import Link from "@/components/Link";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { property, rentReceipt, tenant, user } from "@/lib/types";
import { reviveDates } from "../../lib/revive-dates";
import { rentReceiptStatusVariants } from "./constants";
import { RentReceiptPreview } from "./RentReceiptPreview";
import { RentReceiptStatusActions } from "./RentReceiptStatusActions";

type ReceiptWithDetails = rentReceipt & {
  property: (property & { user?: user | null }) | null;
  tenant: tenant | null;
};

export function RentReceiptDetailPage() {
  const { id = "" } = useParams();
  const t = useTranslations("rent-receipts");
  const rawReceipt = useQuery(api.rentReceipts.getById, id ? { id } : "skip");
  const receipt = useMemo(
    () => rawReceipt ? reviveDates(rawReceipt) as unknown as ReceiptWithDetails : null,
    [rawReceipt],
  );

  if (rawReceipt === undefined) {
    return (
      <div className="container p-6 space-y-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-32" />
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="h-[calc(100vh-12rem)] bg-muted rounded-md" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="container p-6 space-y-6">
        <Link href="/rent-receipts" className="hover:text-foreground transition-colors flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back-to-list")}
        </Link>
        <Card className="p-6 text-muted-foreground">{t("detail.not-found")}</Card>
      </div>
    );
  }

  const propertyTitle = receipt.property?.title ?? t("missing-property");
  const tenantName = receipt.tenant
    ? `${receipt.tenant.firstName} ${receipt.tenant.lastName}`
    : t("missing-tenant");

  return (
    <div className="container p-6 space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/rent-receipts" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("back-to-list")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-foreground font-medium truncate">
          {propertyTitle} - {tenantName}
        </span>
      </nav>
      <div className="flex items-center justify-between">
        <PageTitle>
          {propertyTitle} - {tenantName}
        </PageTitle>
        <div className="flex items-center gap-4">
          <RentReceiptStatusActions receiptId={receipt.id} currentStatus={receipt.status} />
          <Badge className={cn(rentReceiptStatusVariants[receipt.status], "font-medium shadow-none")}>
            {t("status." + receipt.status)}
          </Badge>
        </div>
      </div>
      <Card className="p-6">
        <RentReceiptPreview receipt={receipt} />
      </Card>
    </div>
  );
}
