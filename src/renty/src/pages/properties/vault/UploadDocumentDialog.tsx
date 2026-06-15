"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp, Upload } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { DocumentCategory } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categoryItems, documentFormSchema, type DocumentFormValues } from "./document-form";

interface UploadDocumentDialogProps {
  propertyId: string;
}

export function UploadDocumentDialog({ propertyId }: UploadDocumentDialogProps) {
  const t = useTranslations("documents");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveUploadedFile = useMutation(api.files.saveUploadedFile);
  const createDocument = useMutation(api.documents.create);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema(t)),
    defaultValues: {
      name: "",
      description: "",
      category: DocumentCategory.OTHER,
      sharedWithTenant: false,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      const fileName = files[0].name.split(".").slice(0, -1).join(".");
      form.setValue("name", fileName);
    }
  };

  const onSubmit = async (values: DocumentFormValues) => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("please-select-file"),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type || "application/octet-stream" },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const { storageId } = await uploadResponse.json();
      const fileUrl = await saveUploadedFile({
        storageId,
        bucket: "document",
        name: selectedFile.name,
        contentType: selectedFile.type || undefined,
        size: selectedFile.size,
      });

      const fileType = selectedFile.name.split(".").pop()?.toLowerCase() || "";
      await createDocument({
        propertyId,
        name: values.name,
        fileUrl,
        fileType,
        fileSize: selectedFile.size,
        category: values.category,
        sharedWithTenant: values.sharedWithTenant,
        description: values.description || null,
      });

      toast({
        title: t("success"),
        description: t("document-uploaded-successfully"),
      });
      form.reset();
      setSelectedFile(null);
      setOpen(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error instanceof Error ? error.message : t("error-uploading-document"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          {t("upload-document")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("upload-document")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid w-full place-items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              />
              <div
                onClick={triggerFileInput}
                onKeyUp={triggerFileInput}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-border hover:border-gray-400 cursor-pointer bg-gray-50"
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <FileUp className="h-8 w-8 text-blue-500" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                    <FileUp className="h-8 w-8" />
                    <p>{t("drag-drop-or-click")}</p>
                    <p className="text-xs text-muted-foreground">{t("supported-formats")}</p>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("document-name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("category")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("select-category")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryItems(t).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sharedWithTenant"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("share-with-tenant")}</FormLabel>
                    <FormDescription>{t("share-with-tenant-description")}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
                disabled={isSubmitting}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedFile}>
                {isSubmitting ? t("uploading") : t("upload")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
