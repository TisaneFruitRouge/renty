"use client";

import { Plus } from "lucide-react";
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
import type { lease, property } from "@/lib/types";
import CreateTenantForm from "./CreateTenantForm";

interface CreateTenantModalProps {
  leases: (lease & { property: property })[];
}

export default function CreateTenantModal({ leases }: CreateTenantModalProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("tenants");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("add-tenant")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("create-form.title")}</DialogTitle>
          <DialogDescription>
            {t("create-form.description")}
          </DialogDescription>
        </DialogHeader>
        <CreateTenantForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          leases={leases}
        />
      </DialogContent>
    </Dialog>
  );
}
