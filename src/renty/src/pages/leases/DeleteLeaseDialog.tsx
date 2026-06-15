"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { useRouter } from "@/lib/navigation";
import { api } from "@/convex/_generated/api";
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
import { useToast } from "@/hooks/use-toast";
import type { lease } from "@/lib/types";
import { useCurrentUserId } from "../../lib/current-user";

interface DeleteLeaseDialogProps {
  lease: lease;
  children: React.ReactNode;
}

export default function DeleteLeaseDialog({ lease, children }: DeleteLeaseDialogProps) {
  const t = useTranslations("lease.delete");
  const { toast } = useToast();
  const router = useRouter();
  const userId = useCurrentUserId();
  const removeLease = useMutation(api.leases.remove);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!userId) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("authenticated"),
        });
        return;
      }
      await removeLease({ id: lease.id, userId });
      toast({ title: t("success"), description: t("success") });
      setOpen(false);
      router.push("/leases");
    } catch (error) {
      console.error("Error deleting lease:", error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("error"),
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
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Suppression..." : t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
