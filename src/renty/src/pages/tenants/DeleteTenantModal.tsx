"use client";

import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n";
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
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { tenant } from "@/lib/types";
import { useCurrentUserId } from "../../lib/current-user";

interface DeleteTenantModalProps {
  tenant: tenant;
}

export default function DeleteTenantModal({ tenant }: DeleteTenantModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("tenant");
  const userId = useCurrentUserId();
  const deleteTenant = useMutation(api.tenants.remove);
  const removeFromPropertyChannel = useMutation(api.tenants.removeFromPropertyChannelByLease);

  async function handleDelete() {
    try {
      if (!userId) {
        toast({
          title: t("delete.error"),
          description: t("delete.authenticated"),
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      if (tenant.leaseId) {
        await removeFromPropertyChannel({ leaseId: tenant.leaseId, tenantId: tenant.id });
      }
      await deleteTenant({ id: tenant.id, userId });

      toast({
        title: t("delete.success"),
      });

      setOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: t("delete.error"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("delete.title")}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete.description", { name: `${tenant.firstName} ${tenant.lastName}` })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("delete.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {t("delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
