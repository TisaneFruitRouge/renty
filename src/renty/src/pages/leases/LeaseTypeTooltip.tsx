"use client";

import { HelpCircle } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LeaseTypeTooltip() {
  const t = useTranslations("lease.create-form.lease-type");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex text-muted-foreground hover:text-foreground"
            aria-label={t("help-label")}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-xs space-y-2 border bg-popover px-3 py-2 text-left text-popover-foreground shadow-md"
        >
          <p><span className="font-semibold">{t("individual")}:</span> {t("individual-description")}</p>
          <p><span className="font-semibold">{t("shared")}:</span> {t("shared-description")}</p>
          <p><span className="font-semibold">{t("colocation")}:</span> {t("colocation-description")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
