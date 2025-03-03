import type { property } from "@prisma/client"
import { Building2, ArrowRight } from "lucide-react"
import Property from "./Property"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CreatePropertyModal from "./CreatePropertyModal"

interface PropertiesListProps {
    properties: property[]
}

export default async function PropertiesList({ properties }: PropertiesListProps) {
    const t = await getTranslations('property');
    const propertiesT = await getTranslations('properties');

    return (
        <div className="relative">
            {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-6 mt-12 bg-muted/20 border border-border rounded-xl p-12 text-center">
                    <div className="bg-background p-4 rounded-full shadow-sm border border-border">
                        <Building2 className="h-16 w-16 text-primary" />
                    </div>
                    
                    <div className="space-y-2 max-w-md">
                        <h2 className="text-xl font-semibold">{t("no-properties-found")}</h2>
                        <p className="text-muted-foreground">
                            {t("empty-state-description")}
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <CreatePropertyModal />
                        
                        <Link href="/tenants">
                            <Button variant="outline" className="gap-2 w-full">
                                {propertiesT("explore-features")}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
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