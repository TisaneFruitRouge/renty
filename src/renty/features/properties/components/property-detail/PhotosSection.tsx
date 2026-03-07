"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import type { property } from "@prisma/client"
import { ImagePlus } from "lucide-react"
import EditPropertyPhotosModal from "./EditPropertyPhotosModal"

interface PhotosSectionProps {
    property: property
}

export default function PhotosSection({ property }: PhotosSectionProps) {
    const t = useTranslations('property')
    const images = property.images as string[]

    return (
        <div className="bg-card rounded-md border border-border overflow-hidden">
            <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold">{t("photos")}</h2>
                    <EditPropertyPhotosModal property={property} />
                </div>

                {images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-border rounded-md text-center">
                        <div className="p-3 rounded-md bg-muted">
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{t("no-photos-found")}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t("add-photos-description")}</p>
                        </div>
                    </div>
                ) : images.length === 1 ? (
                    <div className="relative w-full aspect-[16/7] rounded-md overflow-hidden">
                        <Image
                            src={images[0]}
                            alt={property.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-2 h-56">
                        {images.slice(0, 2).map((image, i) => (
                            <div key={i} className="relative rounded-md overflow-hidden">
                                <Image src={image} alt={`${property.title} ${i + 1}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Hero + thumbnails grid (3+ photos) */
                    <div className="grid grid-cols-3 gap-2 h-56">
                        {/* Primary hero: spans 2 rows */}
                        <div className="col-span-2 relative rounded-md overflow-hidden">
                            <Image src={images[0]} alt={property.title} fill className="object-cover" />
                        </div>
                        {/* Right column: up to 2 thumbnails */}
                        <div className="grid grid-rows-2 gap-2">
                            {images.slice(1, 3).map((image, i) => (
                                <div key={i} className="relative rounded-md overflow-hidden">
                                    <Image src={image} alt={`${property.title} ${i + 2}`} fill className="object-cover" />
                                    {/* "Show all" overlay on last visible thumbnail if more photos exist */}
                                    {i === 1 && images.length > 3 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                                            <span className="text-white text-sm font-semibold">+{images.length - 3}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
