"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { property } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarSync } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { 
  deleteRentReceiptSettingsAction, 
  updateRentReceiptSettingsAction 
} from "@/features/properties/actions";
import { calculateReceiptDates } from "@/features/rent-receipt/utils";

interface RentReceiptSettingsProps {
  property: property;
}

export default function RentReceiptSettings({ property }: RentReceiptSettingsProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(property.rentReceiptStartDate || undefined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("property.rent-receipt");
  const { toast } = useToast();
  const tomorrow = addDays(new Date(), 0);

  const { startDate, endDate } = calculateReceiptDates(property.paymentFrequency, date);

  const handleSave = async () => {
    if (!date) return;
    
    try {
      setLoading(true);
      await updateRentReceiptSettingsAction(property.id, date);

      toast({
        title: t("configuration.success"),
        description: format(date, "PPP", { locale: fr }),
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to save rent receipt settings", error);
      toast({
        variant: "destructive",
        title: t("configuration.error"),
        description: error instanceof Error ? error.message : t("configuration.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteRentReceiptSettingsAction(property.id);

      toast({
        title: t("configuration.deleted"),
      });
      setDate(undefined);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete rent receipt settings", error);
      toast({
        variant: "destructive",
        title: t("configuration.error"),
        description: error instanceof Error ? error.message : t("configuration.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarSync className="h-4 w-4 mr-2" />
          {property.rentReceiptStartDate 
            ? `${t("configuration.automatic-send")} ${format(property.rentReceiptStartDate, "d MMMM yyyy", { locale: fr })}`
            : t("configure")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <DialogTitle>{property.rentReceiptStartDate ? t("edit.title") : t("configuration.title")}</DialogTitle>
          <DialogDescription>
            {property.rentReceiptStartDate ? t("edit.description") : t("configuration.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm italic flex flex-col gap-8 justify-center items-center py-6">
          {date && (
            <p className="w-full">{t("configuration.next-receipt-info", {
              startDate: format(startDate, "d MMMM yyyy", { locale: fr }),
              endDate: format(endDate, "d MMMM yyyy", { locale: fr }),
            })}</p>
          )}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={fr}
            fromDate={tomorrow}
            className="rounded-md border w-fit"
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex justify-center">
            {property.rentReceiptStartDate && (
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {t("actions.delete")}
              </Button>
            )}
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {t("actions.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!date || loading}>
              {t("actions.save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
