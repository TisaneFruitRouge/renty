import { History, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { property } from "@prisma/client";
import RentReceiptSettings from "./RentReceiptSettings";

interface PropertyQuickActionsProps {
    property: property;
}

export function PropertyQuickActions({ property }: PropertyQuickActionsProps) {
    const t = useTranslations('property');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("quick-actions")}</h2>
                <div className="space-y-3">
                    <RentReceiptSettings property={property} />
                    <Button variant="outline" className="w-full flex items-center justify-center">
                        <History className="w-4 h-4 mr-2" />
                        {t("rent-receipts-history")}
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {t("contact-tenant")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
