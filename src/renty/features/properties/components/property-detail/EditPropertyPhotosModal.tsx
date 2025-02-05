"use client"

import { useTranslations } from "next-intl"
import { Star, StarOff, Trash2, Upload, ImagePlus, Images } from "lucide-react"
import { type property } from "@prisma/client"
import { useState } from "react"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { uploadPropertyImagesAction, removePropertyImageAction, setPrimaryPropertyImageAction } from "../../actions"

interface EditPropertyPhotosModalProps {
    property: property
    onSuccess?: () => void
}

export default function EditPropertyPhotosModal({ property, onSuccess }: EditPropertyPhotosModalProps) {
    const [open, setOpen] = useState(false)
    const t = useTranslations('property')

    const handleSuccess = () => {
        setOpen(false)
        onSuccess?.()
    }

    const { toast } = useToast()

    const handleUploadImages = async (files: FileList) => {
        try {
            const result = await uploadPropertyImagesAction(property.id, Array.from(files));
            if (!result.success) {
                throw new Error(result.error);
            }
            handleSuccess();
            toast({
                title: t('success'),
                description: t('photos-uploaded-successfully'),
            })
        } catch (error) {
            console.error('Error uploading images:', error);
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error-uploading-photos'),
            })
        }
    }

    const handleRemoveImage = async (imageUrl: string) => {
        try {
            const result = await removePropertyImageAction(property.id, imageUrl);
            if (!result.success) {
                throw new Error(result.error);
            }
            toast({
                title: t('success'),
                description: t('photo-removed-successfully'),
            })
        } catch (error) {
            console.error('Error removing image:', error);
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error-removing-photo'),
            })
        }
    }

    const handleSetPrimaryImage = async (imageUrl: string) => {
        try {
            const result = await setPrimaryPropertyImageAction(property.id, imageUrl);
            if (!result.success) {
                throw new Error(result.error);
            }
            toast({
                title: t('success'),
                description: t('primary-photo-set-successfully'),
            })
        } catch (error) {
            console.error('Error setting primary image:', error);
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error-setting-primary-photo'),
            })
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUploadImages(e.target.files)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    {property.images.length > 0 ? (
                        <>
                            <Images className="h-4 w-4" />
                            {t("modify-photos")}
                        </>
                    ) : (
                        <>
                            <ImagePlus className="h-4 w-4" />
                            {t("add-photos")}
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("edit-photos")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Upload Section */}
                    <div className="flex items-center gap-4">
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                id="photo-upload"
                            />
                            <Button 
                                type="button" 
                                asChild
                            >
                                <label htmlFor="photo-upload" className="flex items-center gap-2 cursor-pointer">
                                    <Upload className="h-4 w-4" />
                                    {t("upload-photos")}
                                </label>
                            </Button>
                        </div>
                    </div>

                    {/* Images Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {property.images.map((image, index) => (
                            <div
                                key={index}
                                className="group relative aspect-video rounded-lg overflow-hidden border border-border"
                            >
                                <Image
                                    src={image}
                                    alt={`${t("photo")} ${index + 1}`}
                                    className="object-cover"
                                    fill
                                />
                                
                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={() => handleSetPrimaryImage(image)}
                                        className={cn(
                                            "h-8 w-8",
                                            image === property.images[0] && "text-yellow-400 hover:text-yellow-500"
                                        )}
                                        title={image === property.images[0] ? t("remove-primary") : t("set-as-primary")}
                                    >
                                        {image === property.images[0] ? (
                                            <StarOff className="h-4 w-4" />
                                        ) : (
                                            <Star className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={() => handleRemoveImage(image)}
                                        className="h-8 w-8"
                                        title={t("remove-photo")}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Primary indicator */}
                                {image === property.images[0] && (
                                    <div className="absolute top-2 left-2 text-yellow-400">
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
