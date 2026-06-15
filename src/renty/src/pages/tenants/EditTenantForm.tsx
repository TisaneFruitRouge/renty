"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "@/lib/i18n";
import * as z from "zod";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { lease, property, tenant } from "@/lib/types";
import { useCurrentUserId } from "../../lib/current-user";

type TFunction = (key: string) => string;

const createTenantFormSchema = (t: TFunction) => z.object({
  firstName: z.string().min(2, {
    message: t("create-form.validation.first-name"),
  }),
  lastName: z.string().min(2, {
    message: t("create-form.validation.last-name"),
  }),
  email: z.string().email({
    message: t("create-form.validation.email"),
  }),
  phoneNumber: z.string().min(10, {
    message: t("create-form.validation.phone"),
  }),
  notes: z.string().optional(),
  leaseId: z.string({
    required_error: t("create-form.validation.lease-required"),
  }).min(1, t("create-form.validation.lease-required")),
});

export type EditTenantFormData = z.infer<ReturnType<typeof createTenantFormSchema>>;

interface EditTenantFormProps {
  tenant: tenant;
  leases?: (lease & { property: property })[];
  onSuccess?: () => void;
}

export default function EditTenantForm({ tenant, leases = [], onSuccess }: EditTenantFormProps) {
  const t = useTranslations("tenant");
  const userId = useCurrentUserId();
  const updateTenant = useMutation(api.tenants.update);
  const addToPropertyChannel = useMutation(api.tenants.addToPropertyChannelByLease);
  const removeFromPropertyChannel = useMutation(api.tenants.removeFromPropertyChannelByLease);
  const [loading, setLoading] = useState(false);
  const formSchema = createTenantFormSchema(t);

  const form = useForm<EditTenantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email || "",
      phoneNumber: tenant.phoneNumber || "",
      notes: tenant.notes || "",
      leaseId: tenant.leaseId || "",
    },
  });

  async function onSubmit(values: EditTenantFormData) {
    try {
      if (!userId) {
        toast({
          title: t("edit-form.error"),
          description: t("create-form.validation.authenticated"),
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const oldLeaseId = tenant.leaseId;
      const newLeaseId = values.leaseId || null;

      await updateTenant({
        id: tenant.id,
        userId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        notes: values.notes || null,
        leaseId: newLeaseId,
      });

      if (oldLeaseId !== newLeaseId) {
        if (oldLeaseId) {
          await removeFromPropertyChannel({ leaseId: oldLeaseId, tenantId: tenant.id });
        }
        if (newLeaseId) {
          await addToPropertyChannel({ leaseId: newLeaseId, tenantId: tenant.id });
        }
      }

      toast({
        title: t("edit-form.success"),
      });
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        title: t("edit-form.error"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("create-form.first-name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("create-form.last-name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create-form.email")}</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create-form.phone")}</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="leaseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create-form.lease")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("create-form.select-lease")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leases.map((lease) => (
                    <SelectItem key={lease.id} value={lease.id}>
                      {lease.property.title} - {lease.leaseType}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("create-form.notes")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("edit-form.submit")}
        </Button>
      </form>
    </Form>
  );
}
