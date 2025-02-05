"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import type { property } from "@prisma/client"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import EditPropertyPhotosModal from "./EditPropertyPhotosModal"

interface PhotosSectionProps {
    property: property
}

export default function PhotosSection({ property }: PhotosSectionProps) {
    const t = useTranslations('property')

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="py-6 px-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{t("photos")}</h2>
                    <EditPropertyPhotosModal property={property} />
                </div>
                {property.images.length > 0 ? (
                    <Carousel
                        opts={{
                            align: "start",
                            slidesToScroll: 3,
                        }}
                        className="w-full relative px-8"
                    >
                        <CarouselContent className="-ml-4">
                            {property.images.map((image: string, index: number) => (
                                <CarouselItem key={index} className="pl-4 basis-1/3">
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                        <Image
                                            src={image}
                                            alt={`${t("view")} ${index + 1} ${t("of")} ${property.title}`}
                                            className="object-cover w-full h-full"
                                            fill
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-0" />
                        <CarouselNext className="absolute right-0" />
                    </Carousel>
                ) : (
                    <p className="text-muted-foreground w-full italic text-center">{t("no-photos-found")}</p>
                )}
            </div>
        </div>
    )
}
