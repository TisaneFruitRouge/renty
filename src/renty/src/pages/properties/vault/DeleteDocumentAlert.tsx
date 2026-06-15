"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { type document as DocumentType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteDocumentAlertProps {
  document: DocumentType;
  propertyId: string;
  children: React.ReactNode;
}

export function DeleteDocumentAlert({ document, propertyId: _propertyId, children }: DeleteDocumentAlertProps) {
  const t = useTranslations("documents");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const removeDocument = useMutation(api.documents.remove);
  const deleteFileByUrl = useMutation(api.files.deleteByUrl);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const removed = await removeDocument({ id: document.id });
      await deleteFileByUrl({ url: removed.fileUrl });
      toast({
        title: t("success"),
        description: t("document-deleted-successfully"),
      });
      setOpen(false);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: error instanceof Error ? error.message : t("error-deleting-document"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirm-delete")}</AlertDialogTitle>
          <AlertDialogDescription>{t("delete-document-confirmation")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
