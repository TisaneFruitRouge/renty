"use client";

import { useMutation } from "convex/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarSync, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { lease } from "@/lib/types";
import { useCurrentUserId } from "../../lib/current-user";

interface LeaseRentReceiptSettingsProps {
  lease: lease;
  className?: string;
}

function nextReceiptDateFor(day: number) {
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth(), day);
  if (next < now) next = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return next.getTime();
}

export default function LeaseRentReceiptSettings({ lease, className }: LeaseRentReceiptSettingsProps) {
  const t = useTranslations("lease.rent-receipt-settings");
  const userId = useCurrentUserId();
  const updateSettings = useMutation(api.leases.updateRentReceiptSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(lease.autoGenerateReceipts);
  const [generationDate, setGenerationDate] = useState(lease.receiptGenerationDate || 1);
  const { toast } = useToast();

  const handleToggleAutoGenerate = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      await updateSettings({
        userId,
        id: lease.id,
        autoGenerateReceipts: enabled,
        receiptGenerationDate: enabled ? generationDate : null,
        nextReceiptDate: enabled ? nextReceiptDateFor(generationDate) : null,
      });
      toast({
        title: t("success"),
        description: enabled ? t("enabled-description") : t("disabled-description"),
      });
      setAutoGenerate(enabled);
    } catch (error) {
      toast({ title: t("error"), description: t("update-error") });
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
        await updateSettings({
          userId,
          id: lease.id,
          autoGenerateReceipts: true,
          receiptGenerationDate: dateNumber,
          nextReceiptDate: nextReceiptDateFor(dateNumber),
        });
        toast({ title: t("success"), description: t("date-updated") });
      } catch (error) {
        toast({ title: t("error"), description: t("update-error") });
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="auto-generate" className="text-base font-medium">
              {t("auto-generate")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("auto-generate-description")}
            </p>
          </div>
          <Switch id="auto-generate" checked={autoGenerate} onCheckedChange={handleToggleAutoGenerate} disabled={isLoading} />
        </div>

        {autoGenerate && (
          <div className="space-y-3">
            <Label htmlFor="generation-date" className="text-sm font-medium">
              {t("generation-date")}
            </Label>
            <Select value={generationDate.toString()} onValueChange={handleGenerationDateChange} disabled={isLoading}>
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
            <p className="text-xs text-muted-foreground">{t("generation-date-help")}</p>
          </div>
        )}

        {autoGenerate && lease.nextReceiptDate && (
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <CalendarSync className="h-4 w-4" />
              <span className="font-medium">{t("next-receipt")}:</span>
              <span>{format(new Date(lease.nextReceiptDate), "dd MMMM yyyy", { locale: fr })}</span>
            </div>
          </div>
        )}

        {!autoGenerate && (
          <div className="p-3 bg-warning-muted border border-warning/30 rounded-md">
            <p className="text-sm text-warning-foreground">{t("not-configured")}</p>
          </div>
        )}

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
