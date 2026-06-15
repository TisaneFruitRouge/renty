"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import type { property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateLeaseWizard from "../../leases/CreateLeaseWizard";

interface CreateLeaseModalProps {
  property: property;
  onSuccess?: () => void;
}

export default function CreateLeaseModal({ property, onSuccess }: CreateLeaseModalProps) {
  const t = useTranslations("lease.create-form");
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("open-title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("open-title")}</DialogTitle>
        </DialogHeader>
        <CreateLeaseWizard
          properties={[property]}
          propertyId={property.id}
          onSuccess={() => {
            setIsOpen(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
