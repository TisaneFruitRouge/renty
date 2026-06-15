"use client";

import { Edit } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { lease, property, tenant } from "@/lib/types";
import EditTenantForm from "./EditTenantForm";

interface EditTenantModalProps {
  tenant: tenant;
  leases: (lease & { property: property })[];
}

export default function EditTenantModal({ tenant, leases }: EditTenantModalProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("tenant");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("edit-form.title")}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("edit-form.title")}</DialogTitle>
          <DialogDescription>
            {t("edit-form.description")}
          </DialogDescription>
        </DialogHeader>
        <EditTenantForm
          tenant={tenant}
          leases={leases}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
