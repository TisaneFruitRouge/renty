"use client"

import { useTranslations } from "next-intl"
import { Star, StarOff, Trash2, Upload, Images, ImagePlus } from "lucide-react"
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
    const [isDragging, setIsDragging] = useState(false)
    const t = useTranslations('property')
    const { toast } = useToast()

    const handleOpenChange = (next: boolean) => {
        setOpen(next)
        if (!next) {
            setTimeout(() => { document.body.style.pointerEvents = '' }, 0)
            onSuccess?.()
        }
    }

    const handleUploadImages = async (files: FileList | File[]) => {
        try {
            const result = await uploadPropertyImagesAction(property.id, Array.from(files))
            if (!result.success) throw new Error(result.error)
            toast({ title: t('success'), description: t('photos-uploaded-successfully') })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error-uploading-photos'),
            })
        }
    }

    const handleRemoveImage = async (imageUrl: string) => {
        try {
            const result = await removePropertyImageAction(property.id, imageUrl)
            if (!result.success) throw new Error(result.error)
            toast({ title: t('success'), description: t('photo-removed-successfully') })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error instanceof Error ? error.message : t('error-removing-photo'),
            })
        }
    }

    const handleSetPrimaryImage = async (imageUrl: string) => {
        try {
            const result = await setPrimaryPropertyImageAction(property.id, imageUrl)
            if (!result.success) throw new Error(result.error)
            toast({ title: t('success'), description: t('primary-photo-set-successfully') })
        } catch (error) {
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

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files.length > 0) {
            handleUploadImages(e.dataTransfer.files)
        }
    }

    const images = property.images as string[]

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    {images.length > 0 ? (
                        <><Images className="h-4 w-4" />{t("modify-photos")}</>
                    ) : (
                        <><ImagePlus className="h-4 w-4" />{t("add-photos")}</>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t("edit-photos")}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 overflow-y-auto">
                    {/* Dropzone */}
                    <label
                        htmlFor="photo-upload"
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed rounded-md cursor-pointer transition-colors",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-muted/40"
                        )}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <div className="p-2 rounded-md bg-muted">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">{t("upload-photos")}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t("drag-drop-or-click")}</p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="photo-upload"
                        />
                    </label>

                    {/* Photos grid */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="group relative aspect-video rounded-md overflow-hidden border border-border"
                                >
                                    <Image
                                        src={image}
                                        alt={`${t("photo")} ${index + 1}`}
                                        className="object-cover"
                                        fill
                                    />

                                    {/* Primary badge */}
                                    {index === 0 && (
                                        <div className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1.5 py-0.5 flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-white text-xs font-medium">{t("primary")}</span>
                                        </div>
                                    )}

                                    {/* Hover overlay with actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {index !== 0 && (
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => handleSetPrimaryImage(image)}
                                                className="h-8 w-8"
                                                title={t("set-as-primary")}
                                            >
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {index === 0 && images.length > 1 && (
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => handleSetPrimaryImage(images[1])}
                                                className="h-8 w-8"
                                                title={t("remove-primary")}
                                            >
                                                <StarOff className="h-4 w-4" />
                                            </Button>
                                        )}
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
