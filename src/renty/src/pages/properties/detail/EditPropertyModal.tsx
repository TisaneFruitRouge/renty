"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import type { property } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { updatePropertySchema, type PropertyFormValues } from "../property-schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EditPropertyModalProps {
  property: property;
  onSuccess?: () => void;
}

function EditPropertyForm({ property, onSuccess }: EditPropertyModalProps) {
  const t = useTranslations("property");
  const { toast } = useToast();
  const updateProperty = useMutation(api.properties.update);
  const propertySchema = updatePropertySchema(t);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property.title,
      address: property.address,
      city: property.city,
      state: property.state,
      country: property.country,
      postalCode: property.postalCode,
    },
  });

  const onSubmit = async (values: PropertyFormValues) => {
    try {
      const result = await updateProperty({
        id: property.id,
        ...values,
      });

      if (!result) {
        throw new Error("Couldn't update property");
      }

      toast({
        title: t("edit-form.success-title"),
        description: t("edit-form.success-description"),
      });

      onSuccess?.();
    } catch {
      toast({
        variant: "destructive",
        title: t("edit-form.error-title"),
        description: t("edit-form.error-description"),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.title")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.address")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.city")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.state")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.country")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.postal-code")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          {t("edit-form.submit")}
        </Button>
      </form>
    </Form>
  );
}

export default function EditPropertyModal({ property, onSuccess }: EditPropertyModalProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("property");

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center" variant="outline">
          <Pencil className="w-4 h-4 mr-2" />
          {t("edit-property")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("edit-form.title")}</DialogTitle>
          <DialogDescription>{t("edit-form.description")}</DialogDescription>
        </DialogHeader>
        <EditPropertyForm property={property} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
