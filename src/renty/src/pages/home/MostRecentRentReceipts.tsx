import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReceiptText } from "lucide-react";
import { useTranslations } from "../../lib/i18n";
import Link from "../../components/Link";
import { useRouter } from "../../lib/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { property, rentReceipt, tenant } from "@/lib/types";
import { rentReceiptStatusVariants } from "../rent-receipts/constants";

type ReceiptWithRelations = rentReceipt & { property: property | null; tenant: tenant | null };

function RecentActivityItem({ receipt, className }: { receipt: ReceiptWithRelations; className?: string }) {
  const t = useTranslations("rent-receipts");
  const router = useRouter();
  const statusText = t(`status.${receipt.status}`);
  const tenantName = receipt.tenant
    ? `${receipt.tenant.firstName} ${receipt.tenant.lastName}`
    : t("missing-tenant");

  return (
    <div
      className={cn("first:border-t flex items-center justify-between p-4 hover:bg-primary/15 cursor-pointer", className)}
      onClick={() => router.push(`/rent-receipts/${receipt.id}`)}
    >
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground">
          <ReceiptText className="h-5 w-5" />
        </div>
        <div>
          <div className="font-medium text-sm">{tenantName}</div>
          <div className="text-sm text-muted-foreground">
            Paiement {statusText.toLowerCase()} · {format(new Date(receipt.startDate), "dd/MM/yyyy", { locale: fr })}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="font-semibold text-sm">{receipt.baseRent + receipt.charges} €</div>
        <Badge className={cn(rentReceiptStatusVariants[receipt.status], "font-medium shadow-none")}>
          {statusText}
        </Badge>
      </div>
    </div>
  );
}

export default function MostRecentRentReceipts({ receipts }: { receipts: ReceiptWithRelations[] }) {
  const t = useTranslations("home");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-xl">{t("recent-activity")}</CardTitle>
        <Link href="/rent-receipts">
          <Button>{t("see-more")}</Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0 divide-y">
        {receipts.map((receipt) => (
          <RecentActivityItem key={receipt.id} receipt={receipt} />
        ))}
      </CardContent>
    </Card>
  );
}
