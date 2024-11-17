import type { property } from "@prisma/client"
import CreatePropertyModal from "./CreatePropertyModal"
import { Home } from "lucide-react"
import Property from "./Property"
import { getTranslations } from "next-intl/server"

interface PropertiesListProps {
    properties: property[]
}

export default async function PropertiesList({ properties }: PropertiesListProps) {
    
    const t = await getTranslations('home');

    return (
        <div className="relative">
            <div className="absolute top-0 right-0">
                <CreatePropertyModal />
            </div>
            {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 mt-12">
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <h2 className="text-lg text-muted-foreground">{t("no-properties-found")}</h2>
                </div>
            ) : (
                <>
                    <h2 className="text-xl underline font-semibold mb-6">{t("properties")}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {properties.map((property) => (
                            <Property key={property.id} property={property} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}