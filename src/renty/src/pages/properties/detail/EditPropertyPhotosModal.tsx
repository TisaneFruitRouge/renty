"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ImagePlus, Images, Loader2, Trash2, Upload } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import type { property } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Image from "@/components/Image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditPropertyPhotosModalProps {
  property: property;
  onSuccess?: () => void;
}

type PropertyWithImageStorage = property & {
  imageStorageIds?: Id<"_storage">[] | null;
};

export default function EditPropertyPhotosModal({ property, onSuccess }: EditPropertyPhotosModalProps) {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("property");
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveUploadedFile = useMutation(api.files.saveUploadedFile);
  const deleteFileByUrl = useMutation(api.files.deleteByUrl);
  const updateProperty = useMutation(api.properties.update);
  const images = property.images as string[];
  const imageStorageIds = (property as PropertyWithImageStorage).imageStorageIds ?? [];

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 0);
      onSuccess?.();
    }
  };

  const uploadFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        imageFiles.map(async (file) => {
          const uploadUrl = await generateUploadUrl();
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
          }

          const { storageId } = (await uploadResponse.json()) as { storageId: string };
          const url = await saveUploadedFile({
            storageId: storageId as Id<"_storage">,
            bucket: "propertyImage",
            name: file.name,
            contentType: file.type || undefined,
            size: file.size,
          });

          return { url, storageId };
        }),
      );

      await updateProperty({
        id: property.id,
        images: [...images, ...uploaded.map((file) => file.url)],
        imageStorageIds: [
          ...imageStorageIds,
          ...uploaded.map((file) => file.storageId as Id<"_storage">),
        ],
      });

      toast({
        title: t("success"),
        description: t("photos-uploaded-successfully"),
      });
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error instanceof Error ? error.message : t("error-uploading-photos"),
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = async (imageUrl: string, imageIndex: number) => {
    if (removingUrl) return;

    setRemovingUrl(imageUrl);
    try {
      const nextImages = images.filter((_, index) => index !== imageIndex);
      const nextStorageIds =
        imageStorageIds.length === images.length
          ? imageStorageIds.filter((_, index) => index !== imageIndex)
          : imageStorageIds;

      await updateProperty({
        id: property.id,
        images: nextImages,
        imageStorageIds: nextStorageIds,
      });
      await deleteFileByUrl({ url: imageUrl });

      toast({
        title: t("success"),
        description: t("photo-removed-successfully"),
      });
    } catch (error) {
      console.error("Error removing photo:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error instanceof Error ? error.message : t("error-removing-photo"),
      });
    } finally {
      setRemovingUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          {images.length > 0 ? (
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("edit-photos")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto">
          <label
            htmlFor="photo-upload"
            className={cn(
              "flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed rounded-md cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/40",
            )}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void uploadFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <div className="p-2 rounded-md bg-muted">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{t("upload-photos")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG, WebP
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={isUploading}
              onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))}
            />
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={image} className="group relative aspect-video overflow-hidden rounded-md border bg-muted">
                  <Image src={image} alt={`${t("photo")} ${index + 1}`} fill className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                      disabled={removingUrl === image}
                      onClick={() => void removePhoto(image, index)}
                    >
                      {removingUrl === image ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {t("remove-photo")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
