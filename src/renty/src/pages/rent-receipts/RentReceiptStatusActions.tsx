"use client";

import { useAction, useMutation } from "convex/react";
import { MoreHorizontal, Send } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { RentReceiptStatus } from "@/lib/types";
import { rentReceiptStatusVariants } from "./constants";

interface RentReceiptStatusActionsProps {
  receiptId: string;
  currentStatus: RentReceiptStatus;
}

export const availableStatusTransitions: Record<RentReceiptStatus, RentReceiptStatus[]> = {
  DRAFT: [RentReceiptStatus.PENDING, RentReceiptStatus.CANCELLED],
  PENDING: [RentReceiptStatus.PAID, RentReceiptStatus.LATE, RentReceiptStatus.UNPAID, RentReceiptStatus.CANCELLED],
  PAID: [],
  LATE: [RentReceiptStatus.PAID, RentReceiptStatus.UNPAID, RentReceiptStatus.CANCELLED],
  UNPAID: [RentReceiptStatus.PAID, RentReceiptStatus.LATE, RentReceiptStatus.CANCELLED],
  CANCELLED: [],
};

export function RentReceiptStatusActions({ receiptId, currentStatus }: RentReceiptStatusActionsProps) {
  const t = useTranslations("rent-receipts");
  const { toast } = useToast();
  const updateStatus = useMutation(api.rentReceipts.updateStatus);
  const sendReceipt = useAction(api.rentReceiptWorkflows.sendExisting);

  const handleStatusChange = async (e: React.MouseEvent, status: RentReceiptStatus) => {
    e.stopPropagation();
    try {
      await updateStatus({ id: receiptId, status });
      toast({
        title: t("status-update.success"),
        description: t("status-update.success-description"),
      });
    } catch {
      toast({
        title: t("status-update.error"),
        description: t("status-update.error-description"),
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    try {
      await sendReceipt({ receiptId });
      toast({
        title: t("send.success"),
        description: t("send.success-description"),
      });
    } catch (error) {
      toast({
        title: t("send.error"),
        description: error instanceof Error ? error.message : t("send.error-description"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus === RentReceiptStatus.PENDING && (
        <Button size="sm" onClick={handleSend}>
          <Send className="h-4 w-4 mr-2" />
          {t("actions.send")}
        </Button>
      )}

      {availableStatusTransitions[currentStatus].length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              {t("actions.mark-as")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableStatusTransitions[currentStatus].map((status) => (
              <DropdownMenuItem key={status} onClick={(e) => handleStatusChange(e, status)}>
                <Badge className={cn(rentReceiptStatusVariants[status], "shadow-none mr-2")}>
                  {t("actions.mark-as-" + status.toLowerCase())}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
