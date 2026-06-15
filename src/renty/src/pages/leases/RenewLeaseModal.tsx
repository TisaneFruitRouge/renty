"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslations } from "@/lib/i18n";
import { useRouter } from "@/lib/navigation";
import * as z from "zod";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { lease, property, tenant } from "@/lib/types";
import { useCurrentUserId } from "../../lib/current-user";
import { LeaseTypeTooltip } from "./LeaseTypeTooltip";

type TFunction = (key: string) => string;

const createFormSchema = (t: TFunction) => z.object({
  startDate: z.date({ required_error: t("validation.start-date-required") }),
  endDate: z.date().optional(),
  rentAmount: z.string().min(1, t("validation.rent-required")).refine(val => {
    const num = parseFloat(val);
    return !Number.isNaN(num) && num > 0;
  }, { message: t("validation.rent-positive") }),
  depositAmount: z.string().optional().refine(val => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !Number.isNaN(num) && num >= 0;
  }, { message: t("validation.deposit-valid") }),
  charges: z.string().optional().refine(val => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !Number.isNaN(num) && num >= 0;
  }, { message: t("validation.charges-valid") }),
  leaseType: z.enum(["INDIVIDUAL", "SHARED", "COLOCATION"] as const, {
    required_error: t("validation.lease-type-required"),
  }),
  isFurnished: z.boolean().default(false),
  paymentFrequency: z.enum(["monthly", "quarterly", "yearly"] as const).default("monthly"),
  currency: z.string().default("EUR"),
  notes: z.string().optional(),
});

type RenewLeaseFormData = z.infer<ReturnType<typeof createFormSchema>>;

interface RenewLeaseModalProps {
  lease: lease & { tenants: tenant[]; property: property };
  children: React.ReactNode;
}

function defaultStartDate(endDate: Date | null): Date {
  if (!endDate) return new Date();
  const next = new Date(endDate);
  next.setDate(next.getDate() + 1);
  return next;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function RenewLeaseModal({ lease, children }: RenewLeaseModalProps) {
  const t = useTranslations("lease.renew-lease");
  const leaseT = useTranslations("lease");
  const createT = useTranslations("lease.create-form");
  const { toast } = useToast();
  const router = useRouter();
  const userId = useCurrentUserId();
  const renewLease = useMutation(api.leases.renew);
  const [isOpen, setIsOpen] = useState(false);
  const formSchema = createFormSchema(createT);

  const form = useForm<RenewLeaseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: defaultStartDate(lease.endDate),
      endDate: undefined,
      rentAmount: lease.rentAmount.toString(),
      depositAmount: lease.depositAmount ? lease.depositAmount.toString() : "",
      charges: lease.charges ? lease.charges.toString() : "",
      leaseType: lease.leaseType,
      isFurnished: lease.isFurnished,
      paymentFrequency: lease.paymentFrequency as "monthly" | "quarterly" | "yearly",
      currency: lease.currency,
      notes: lease.notes || "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchedRent = useWatch({ control: form.control, name: "rentAmount" });
  const rentDiff = parseFloat(watchedRent || "0") - lease.rentAmount;
  const formattedRentDiff = `${Math.abs(rentDiff).toFixed(2)} ${lease.currency}`;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setTimeout(() => { document.body.style.pointerEvents = ""; }, 0);
    }
  };

  async function onSubmit(values: RenewLeaseFormData) {
    try {
      if (!userId) {
        toast({ variant: "destructive", title: t("error"), description: t("authenticated") });
        return;
      }
      const tenantCount = lease.tenants.length;
      if ((values.leaseType === "INDIVIDUAL" || values.leaseType === "COLOCATION") && tenantCount > 1) {
        toast({ variant: "destructive", title: t("error"), description: createT("lease-type.individual-description") });
        return;
      }
      if (values.leaseType === "SHARED" && tenantCount === 1) {
        toast({ variant: "destructive", title: t("error"), description: createT("lease-type.shared-description") });
        return;
      }
      const result = await renewLease({
        userId,
        oldLeaseId: lease.id,
        newLease: {
          propertyId: lease.propertyId,
          startDate: values.startDate.getTime(),
          endDate: values.endDate ? values.endDate.getTime() : null,
          rentAmount: parseFloat(values.rentAmount),
          depositAmount: values.depositAmount && values.depositAmount !== "" ? parseFloat(values.depositAmount) : undefined,
          charges: values.charges && values.charges !== "" ? parseFloat(values.charges) : 0,
          leaseType: values.leaseType,
          isFurnished: values.isFurnished,
          paymentFrequency: values.paymentFrequency,
          currency: values.currency,
          notes: values.notes || null,
        },
      });
      toast({ title: t("success") });
      setIsOpen(false);
      router.push(`/leases/${result.newLease.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("error"),
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <SectionHeader label={leaseT("section-period")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("new-start-date")}</FormLabel>
                  <DatePicker value={field.value} onChange={field.onChange} placeholder={createT("select-start-date")} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("new-end-date")}</FormLabel>
                  <DatePicker value={field.value} onChange={field.onChange} placeholder={createT("select-end-date")} />
                  <FormDescription>{createT("end-date.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <SectionHeader label={leaseT("section-financial")} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="rentAmount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="min-h-5">{createT("rent-amount")}</FormLabel>
                  <FormControl><Input placeholder="1200" type="number" step="0.01" min="0" {...field} /></FormControl>
                  <FormDescription className={cn("min-h-5", rentDiff > 0 ? "text-success" : rentDiff < 0 ? "text-destructive" : "invisible")}>
                    {rentDiff > 0
                      ? t("rent-change-increase", { amount: formattedRentDiff })
                      : rentDiff < 0
                        ? t("rent-change-decrease", { amount: `-${formattedRentDiff}` })
                        : "."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="depositAmount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="min-h-5">{createT("deposit-amount.label")}</FormLabel>
                  <FormControl><Input placeholder="1200" type="number" step="0.01" min="0" {...field} /></FormControl>
                  <FormDescription>{createT("deposit-amount.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="charges" render={({ field }) => (
                <FormItem>
                  <FormLabel className="min-h-5">{createT("charges.label")}</FormLabel>
                  <FormControl><Input placeholder="100" type="number" step="0.01" min="0" {...field} /></FormControl>
                  <FormDescription>{createT("charges.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <SectionHeader label={leaseT("section-configuration")} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel className="min-h-5">{leaseT("currency")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="leaseType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex min-h-5 items-center gap-1.5">
                    {createT("lease-type.label")}
                    <LeaseTypeTooltip />
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={createT("select-lease-type")} /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">{createT("lease-type.individual")}</SelectItem>
                      <SelectItem value="SHARED">{createT("lease-type.shared")}</SelectItem>
                      <SelectItem value="COLOCATION">{createT("lease-type.colocation")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="paymentFrequency" render={({ field }) => (
                <FormItem>
                  <FormLabel className="min-h-5">{createT("payment-frequency.label")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={createT("select-payment-frequency")} /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">{createT("payment-frequency.monthly")}</SelectItem>
                      <SelectItem value="quarterly">{createT("payment-frequency.quarterly")}</SelectItem>
                      <SelectItem value="yearly">{createT("payment-frequency.yearly")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <FormField control={form.control} name="isFurnished" render={({ field }) => (
                <FormItem>
                  <FormLabel>{createT("furnished.label")}</FormLabel>
                  <FormControl>
                    <div className="flex items-center h-10 gap-2">
                      <Checkbox
                        id="renewIsFurnished"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label htmlFor="renewIsFurnished" className="text-sm text-muted-foreground cursor-pointer">
                        {createT("furnished.description")}
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>{createT("notes.label")}</FormLabel>
                  <FormControl><Textarea placeholder={createT("notes.placeholder")} className="resize-none" rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("renewing") : t("confirm")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
