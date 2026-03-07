import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { property } from "@prisma/client"
import { Home, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type PropertyProps = {
    property: property;
}

export default function Property({ property }: PropertyProps) {
    return (
        <Link href={`/properties/${property.id}`}>
            <Card className="overflow-hidden hover:border-primary/50 transition-colors duration-200">
                <div className="relative w-full h-32">
                    {property.images.length > 0 ? (
                        <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Home className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <CardHeader className="pb-2 pt-3">
                    <h3 className="text-base font-semibold line-clamp-1 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{property.address}</p>
                </CardHeader>
                <CardContent className="pb-0">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>{property.city},</span>
                        <span>{property.state},</span>
                        <span>{property.country}</span>
                    </div>
                </CardContent>
                <CardFooter className="pt-2 pb-3">
                    <p className="text-xs text-muted-foreground">{property.postalCode}</p>
                </CardFooter>
            </Card>
        </Link>
    )
}