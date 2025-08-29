"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarSync, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast"
import {
  updateLeaseRentReceiptSettingsAction,
  deleteLeaseRentReceiptSettingsAction,
} from "../../actions";
import type { lease } from "@prisma/client";

interface LeaseRentReceiptSettingsProps {
  lease: lease;
  className?: string;
}

export default function LeaseRentReceiptSettings({
  lease,
  className
}: LeaseRentReceiptSettingsProps) {
  const t = useTranslations("lease.rent-receipt-settings");
  const [isLoading, setIsLoading] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(lease.autoGenerateReceipts);
  const [generationDate, setGenerationDate] = useState(lease.receiptGenerationDate || 1);

  const { toast } = useToast();

  const handleToggleAutoGenerate = async (enabled: boolean) => {
    setIsLoading(true);

    try {
      if (enabled) {
        await updateLeaseRentReceiptSettingsAction(lease.id, true, generationDate);
        toast({
          title: t("success"),
          description: t("enabled-description")
        });
      } else {
        await deleteLeaseRentReceiptSettingsAction(lease.id);
        toast({
          title: t("success"),
          description: t("disabled-description")
        });
      }
      setAutoGenerate(enabled);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("update-error")
      });
      console.error("Error updating rent receipt settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerationDateChange = async (date: string) => {
    const dateNumber = parseInt(date);
    setGenerationDate(dateNumber);

    if (autoGenerate) {
      setIsLoading(true);
      try {
        await updateLeaseRentReceiptSettingsAction(lease.id, true, dateNumber);
        toast({
          title: t("success"),
          description: t("date-updated")
        });
      } catch (error) {
        toast({
          title: t("error"),
          description: t("update-error")
        });
        console.error("Error updating generation date:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarSync className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Generate Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="auto-generate" className="text-base font-medium">
              {t("auto-generate")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("auto-generate-description")}
            </p>
          </div>
          <Switch
            id="auto-generate"
            checked={autoGenerate}
            onCheckedChange={handleToggleAutoGenerate}
            disabled={isLoading}
          />
        </div>

        {/* Generation Date Selector */}
        {autoGenerate && (
          <div className="space-y-3">
            <Label htmlFor="generation-date" className="text-sm font-medium">
              {t("generation-date")}
            </Label>
            <Select
              value={generationDate.toString()}
              onValueChange={handleGenerationDateChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {t("day-of-month", { day })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("generation-date-help")}
            </p>
          </div>
        )}

        {/* Next Receipt Date */}
        {autoGenerate && lease.nextReceiptDate && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CalendarSync className="h-4 w-4" />
              <span className="font-medium">{t("next-receipt")}:</span>
              <span>
                {format(new Date(lease.nextReceiptDate), "dd MMMM yyyy", { locale: fr })}
              </span>
            </div>
          </div>
        )}

        {/* Configuration Status */}
        {!autoGenerate && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t("not-configured")}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("updating")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
