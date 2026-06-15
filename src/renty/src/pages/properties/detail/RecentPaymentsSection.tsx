import { Receipt } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import Link from "@/components/Link";
import type { property, rentReceipt, tenant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentPaymentsSectionProps {
  recentPayments: (rentReceipt & { property: property | null; tenant: tenant | null })[];
  propertyId: string;
}

export default function RecentPaymentsSection({ recentPayments, propertyId }: RecentPaymentsSectionProps) {
  const t = useTranslations("property");
  const tRentReceiptsStatus = useTranslations("rent-receipts.status");
  const tRentReceipts = useTranslations("rent-receipts");

  return (
    <div className="bg-card rounded-md border">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t("recent-payments")}</h2>
          <Link href={`/rent-receipts?propertyId=${propertyId}`}>
            <Button variant="ghost">{t("see-more")}</Button>
          </Link>
        </div>
        <div className="space-y-4">
          {recentPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center min-w-0">
                <Receipt className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="ml-4 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {payment.tenant
                      ? `${payment.tenant.firstName} ${payment.tenant.lastName}`
                      : tRentReceipts("missing-tenant")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payment.createdAt?.toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-sm font-medium tabular-nums">
                  {payment.baseRent + payment.charges} €
                </span>
                <Badge className={cn(payment.status === "PAID" ? "bg-success-muted text-success-foreground hover:bg-success-muted" : "bg-destructive/10 text-destructive hover:bg-destructive/10")}>
                  {tRentReceiptsStatus(`${payment.status}`)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
