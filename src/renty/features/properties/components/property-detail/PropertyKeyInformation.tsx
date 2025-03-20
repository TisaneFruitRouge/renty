import type { property } from "@prisma/client";
import { BedDouble, Calendar, Euro } from "lucide-react";
import { useTranslations } from "next-intl";

interface PropertyKeyInformationProps {
    property: property;
}

export function PropertyKeyInformation({ property }: PropertyKeyInformationProps) {
    const t = useTranslations("property");

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border">
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t("key-information")}</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                            <Euro className="w-5 h-5 mr-2" />
                            <span>{t("monthly-rent")}</span>
                        </div>
                        <span className="font-medium">
                            {(property.rentDetails as { baseRent: number; charges: number; })?.baseRent} €
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                            <Euro className="w-5 h-5 mr-2" />
                            <span>{t("charges")}</span>
                        </div>
                        <span className="font-medium">
                            {(property.rentDetails as { baseRent: number; charges: number; })?.charges} €
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                            <Euro className="w-5 h-5 mr-2" />
                            <span>{t("deposit")}</span>
                        </div> 
                        <span className="font-medium">
                            {property.depositAmount} €
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-5 h-5 mr-2" />
                            <span>{t("entry-date")}</span>
                        </div>
                        <span className="font-medium">
                            {property.rentedSince ? new Date(property.rentedSince).toLocaleDateString() : '-'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                            <BedDouble className="w-5 h-5 mr-2" />
                            <span>{t("furnished")}</span>
                        </div>
                        <span className="font-medium">
                            {property.isFurnished ? t("yes") : t("no")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
