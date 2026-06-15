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
import type { lease, property } from "@/lib/types";
import { useCurrentUserId } from "../../lib/current-user";

type TFunction = (key: string) => string;

const createTenantFormSchema = (t: TFunction) => z.object({
  firstName: z.string().min(2, {
    message: t("validation.first-name"),
  }),
  lastName: z.string().min(2, {
    message: t("validation.last-name"),
  }),
  email: z.string().email({
    message: t("validation.email"),
  }),
  phoneNumber: z.string().min(10, {
    message: t("validation.phone"),
  }),
  notes: z.string().optional(),
  leaseId: z.string().optional(),
});

export type CreateTenantFormData = z.infer<ReturnType<typeof createTenantFormSchema>>;

interface CreateTenantFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  leaseId?: string;
  leases?: (lease & { property: property })[];
}

const NO_LEASE_VALUE = "__none__";

function formatLeaseLabel(lease: lease & { property: property }) {
  return `${lease.property.title} · ${lease.leaseType}`;
}

export default function CreateTenantForm({ onSuccess, onCancel, leaseId: initialLeaseId, leases = [] }: CreateTenantFormProps) {
  const t = useTranslations("tenant.create-form");
  const userId = useCurrentUserId();
  const createTenant = useMutation(api.tenants.create);
  const addToPropertyChannel = useMutation(api.tenants.addToPropertyChannelByLease);
  const [loading, setLoading] = useState(false);
  const formSchema = createTenantFormSchema(t);

  const form = useForm<CreateTenantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      notes: "",
      leaseId: initialLeaseId || "",
    },
  });

  async function onSubmit(values: CreateTenantFormData) {
    try {
      if (!userId) {
        toast({
          title: t("error.create"),
          description: t("validation.authenticated"),
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const leaseId = values.leaseId || null;
      const tenant = await createTenant({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        notes: values.notes || null,
        leaseId,
        userId,
      });

      if (leaseId) {
        await addToPropertyChannel({ leaseId, tenantId: tenant.id });
      }

      form.reset();
      toast({
        title: t("success.created"),
      });
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        title: t("error.create"),
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("first-name")}</FormLabel>
                <FormControl>
                  <Input autoComplete="given-name" placeholder={t("first-name-placeholder")} {...field} />
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
                <FormLabel>{t("last-name")}</FormLabel>
                <FormControl>
                  <Input autoComplete="family-name" placeholder={t("last-name-placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder={t("email-placeholder")} {...field} />
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
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" placeholder={t("phone-placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="leaseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("lease")}</FormLabel>
              <Select
                value={field.value || NO_LEASE_VALUE}
                onValueChange={(value) => field.onChange(value === NO_LEASE_VALUE ? "" : value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select-lease")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_LEASE_VALUE}>{t("no-lease")}</SelectItem>
                  {leases.map((lease) => (
                    <SelectItem key={lease.id} value={lease.id}>
                      {formatLeaseLabel(lease)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {leases.length === 0 && (
                <p className="text-xs text-muted-foreground">{t("no-lease-found")}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("notes")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("notes-placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
