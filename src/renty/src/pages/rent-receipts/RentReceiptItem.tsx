"use client";

import { Download, Eye, MoreHorizontal } from "lucide-react";
import type { MouseEventHandler } from "react";
import { useTranslations } from "@/lib/i18n";
import { useRouter } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { property, rentReceipt, tenant } from "@/lib/types";
import { rentReceiptStatusVariants } from "./constants";
import { availableStatusTransitions, RentReceiptStatusActions } from "./RentReceiptStatusActions";

interface RentReceiptItemProps {
  receipt: rentReceipt & { property: property | null; tenant: tenant | null };
  className?: string;
}

export function RentReceiptItem({ receipt, className }: RentReceiptItemProps) {
  const router = useRouter();
  const t = useTranslations("rent-receipts");
  const propertyTitle = receipt.property?.title ?? t("missing-property");
  const tenantName = receipt.tenant
    ? `${receipt.tenant.firstName} ${receipt.tenant.lastName}`
    : t("missing-tenant");

  const handleView: MouseEventHandler<HTMLDivElement> = async () => {
    router.push(`/rent-receipts/${receipt.id}`);
  };

  const handleDownload: MouseEventHandler<HTMLDivElement> = async (e) => {
    e.stopPropagation();
    if (receipt.blobUrl) window.open(receipt.blobUrl, "_blank");
  };

  return (
    <div
      className={cn("flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors", className)}
      onClick={handleView}
    >
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-xs text-muted-foreground tabular-nums">
          {receipt?.createdAt?.toLocaleDateString("fr-FR")}
        </p>
        <p className="font-medium text-sm truncate">{propertyTitle}</p>
        <p className="text-xs text-muted-foreground truncate">
          {tenantName}
        </p>
      </div>

      <div className="shrink-0 mx-4">
        <Badge className={cn(rentReceiptStatusVariants[receipt.status], "font-medium")}>
          {t("status." + receipt.status)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <p className="text-sm font-semibold tabular-nums w-20 text-right">
          {(receipt?.baseRent + receipt?.charges).toLocaleString("fr-FR")}€
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t("actions.more")}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="mr-2 h-4 w-4" />
              {t("actions.view")}
            </DropdownMenuItem>
            {receipt.blobUrl && (
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                {t("actions.download")}
              </DropdownMenuItem>
            )}
            {availableStatusTransitions[receipt.status].length > 0 && (
              <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                <div className="w-full">
                  <RentReceiptStatusActions receiptId={receipt.id} currentStatus={receipt.status} />
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
