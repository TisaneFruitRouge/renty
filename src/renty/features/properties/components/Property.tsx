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
            <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.02] hover:border-primary/20 transition-all duration-300 ease-in-out">
                <div className="relative w-full h-48">
                    {property.images.length > 0 ? (
                        <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Home className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <CardHeader>
                    <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <p className="text-sm line-clamp-1">{property.address}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>{property.city},</span>
                        <span>{property.state},</span>
                        <span>{property.country}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">{property.postalCode}</p>
                </CardFooter>
            </Card>
        </Link>
    )
}