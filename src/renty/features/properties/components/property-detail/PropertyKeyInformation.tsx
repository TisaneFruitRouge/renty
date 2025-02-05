import type { property } from "@prisma/client";
import { BedDouble, Calendar, Euro } from "lucide-react";
import { useTranslations } from "next-intl";

interface PropertyKeyInformationProps {
    property: property;
}

export function PropertyKeyInformation({ property }: PropertyKeyInformationProps) {
    const t = useTranslations("property");

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("key-information")}</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                            <Euro className="w-5 h-5 mr-2" />
                            <span>{t("monthly-rent")}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                            {(property.rentDetails as { baseRent: number; charges: number; })?.baseRent} €
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                            <Euro className="w-5 h-5 mr-2" />
                            <span>{t("charges")}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                            {(property.rentDetails as { baseRent: number; charges: number; })?.charges} €
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                            <Euro className="w-5 h-5 mr-2" />
                            <span>{t("deposit")}</span>
                        </div> 
                        <span className="font-medium text-gray-900">
                            {property.depositAmount} €
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                            <Calendar className="w-5 h-5 mr-2" />
                            <span>{t("entry-date")}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                            {property.rentedSince ? new Date(property.rentedSince).toLocaleDateString() : '-'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                            <BedDouble className="w-5 h-5 mr-2" />
                            <span>{t("furnished")}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                            {property.isFurnished ? t("yes") : t("no")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
