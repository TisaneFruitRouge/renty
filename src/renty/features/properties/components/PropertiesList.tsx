import type { property } from "@prisma/client"
import { Home } from "lucide-react"
import Property from "./Property"
import { getTranslations } from "next-intl/server"

interface PropertiesListProps {
    properties: property[]
}

export default async function PropertiesList({ properties }: PropertiesListProps) {
    const t = await getTranslations('property');

    return (
        <div className="relative">
            {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 mt-12 bg-background border rounded-lg p-8">
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <h2 className="text-lg text-muted-foreground">{t("no-properties-found")}</h2>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map((property) => (
                        <Property key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    )
}