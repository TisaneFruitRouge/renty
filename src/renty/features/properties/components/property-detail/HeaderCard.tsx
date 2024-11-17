import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import type { property } from "@prisma/client"
import { getTranslations } from "next-intl/server"
import EditPropertyModal from "./EditPropertyModal"

interface HeaderCardProps {
    property: property
}

export default async function HeaderCard({ property }: HeaderCardProps) {
    const t = await getTranslations('property');

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">{property.title}</h1>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            <p>{property.address}</p>
                        </div>
                    </div>
                    <EditPropertyModal property={property} />
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid gap-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">{t('location-details')}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('city')}</p>
                                <p>{property.city}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('state')}</p>
                                <p>{property.state}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('country')}</p>
                                <p>{property.country}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('postal-code')}</p>
                                <p>{property.postalCode}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}