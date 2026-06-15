"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Check, ChevronsUpDown, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "@/lib/i18n";
import * as z from "zod";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "@/components/Link";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { property, tenant } from "@/lib/types";
import { reviveDates } from "../../lib/revive-dates";
import { useCurrentUserId } from "../../lib/current-user";
import { LeaseTypeTooltip } from "./LeaseTypeTooltip";

type TFunction = (key: string) => string;

const createStep1Schema = (t: TFunction) => z.object({
  propertyId: z.string({ required_error: t("validation.property-required") }).min(1, t("validation.property-required")),
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

type Step1Data = z.infer<ReturnType<typeof createStep1Schema>>;

interface CreateLeaseWizardProps {
  properties: property[];
  propertyId?: string;
  onSuccess?: () => void;
}

function dateToTimestamp(date?: Date) {
  return date ? date.getTime() : null;
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

function StepIndicator({ step, step1Label, step2Label }: { step: 1 | 2; step1Label: string; step2Label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
        step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary",
      )}>1</div>
      <span className={cn("text-sm shrink-0", step === 1 ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {step1Label}
      </span>
      <div className={cn("flex-1 h-px", step === 2 ? "bg-primary/40" : "bg-border")} />
      <div className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
        step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
      )}>2</div>
      <span className={cn("text-sm shrink-0", step === 2 ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {step2Label}
      </span>
    </div>
  );
}

interface TenantAssignmentStepProps {
  leaseType: "INDIVIDUAL" | "SHARED" | "COLOCATION";
  onBack: () => void;
  onSubmit: (tenantIds: string[]) => Promise<void>;
  isSubmitting: boolean;
}

function TenantAssignmentStep({ leaseType, onBack, onSubmit, isSubmitting }: TenantAssignmentStepProps) {
  const t = useTranslations("lease.wizard");
  const userId = useCurrentUserId();
  const rawTenants = useQuery(api.tenants.listAvailableForUser, userId ? { userId } : "skip");
  const availableTenants = reviveDates(rawTenants ?? []) as unknown as tenant[];
  const loading = rawTenants === undefined;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (leaseType === "INDIVIDUAL" || leaseType === "COLOCATION") {
      setSelectedIds([id]);
    } else {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
      );
    }
    setValidationError(null);
  };

  const handleSubmit = async () => {
    if (leaseType === "INDIVIDUAL" || leaseType === "COLOCATION") {
      if (selectedIds.length !== 1) {
        setValidationError(t("individual-validation"));
        return;
      }
    } else {
      if (selectedIds.length < 2) {
        setValidationError(t("shared-validation"));
        return;
      }
    }
    await onSubmit(selectedIds);
  };

  return (
    <div className="space-y-5">
      {leaseType === "COLOCATION" && (
        <div className="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 p-3 text-sm text-blue-700 dark:text-blue-300">
          {t("colocation-info")}
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-3 text-muted-foreground">
          {leaseType === "SHARED" ? t("select-tenants-shared") : t("select-tenant-individual")}
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{t("loading")}</span>
          </div>
        ) : availableTenants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("no-tenants-available")}</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/tenants">{t("create-tenant")}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {availableTenants.map((tenant) => {
              const isSelected = selectedIds.includes(tenant.id);
              const initials = `${tenant.firstName[0]}${tenant.lastName[0]}`.toUpperCase();
              return (
                <div
                  key={tenant.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30",
                  )}
                  onClick={() => handleSelect(tenant.id)}
                >
                  {leaseType === "SHARED" ? (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelect(tenant.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      isSelected ? "border-primary" : "border-muted-foreground",
                    )}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  )}
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                  )}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{tenant.firstName} {tenant.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {validationError && (
          <p className="text-sm text-destructive mt-2">{validationError}</p>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          {t("back")}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || loading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : t("submit")}
        </Button>
      </div>
    </div>
  );
}

export default function CreateLeaseWizard({ properties, propertyId, onSuccess }: CreateLeaseWizardProps) {
  const t = useTranslations("lease.create-form");
  const wizardT = useTranslations("lease.wizard");
  const leaseT = useTranslations("lease");
  const { toast } = useToast();
  const userId = useCurrentUserId();
  const createLease = useMutation(api.leases.create);
  const updateTenant = useMutation(api.tenants.update);
  const addToPropertyChannel = useMutation(api.tenants.addToPropertyChannelByLease);
  const [step, setStep] = useState<1 | 2>(1);
  const [leaseTermsData, setLeaseTermsData] = useState<Step1Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyOpen, setPropertyOpen] = useState(false);
  const step1Schema = createStep1Schema(t);

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      propertyId: propertyId || "",
      rentAmount: "",
      depositAmount: "",
      charges: "",
      leaseType: "INDIVIDUAL",
      isFurnished: false,
      paymentFrequency: "monthly",
      currency: "EUR",
      notes: "",
    },
  });

  const handleStep1Next = async () => {
    const valid = await form.trigger();
    if (valid) {
      setLeaseTermsData(form.getValues());
      setStep(2);
    }
  };

  const handleTenantSubmit = async (tenantIds: string[]) => {
    if (!leaseTermsData) return;
    setIsSubmitting(true);
    try {
      if (!userId) {
        toast({
          variant: "destructive",
          title: t("error.create"),
          description: t("validation.authenticated"),
        });
        return;
      }

      const newLease = await createLease({
        userId,
        propertyId: leaseTermsData.propertyId,
        startDate: leaseTermsData.startDate.getTime(),
        endDate: dateToTimestamp(leaseTermsData.endDate),
        rentAmount: parseFloat(leaseTermsData.rentAmount),
        depositAmount: leaseTermsData.depositAmount && leaseTermsData.depositAmount !== ""
          ? parseFloat(leaseTermsData.depositAmount) : undefined,
        charges: leaseTermsData.charges && leaseTermsData.charges !== ""
          ? parseFloat(leaseTermsData.charges) : 0,
        leaseType: leaseTermsData.leaseType,
        isFurnished: leaseTermsData.isFurnished,
        paymentFrequency: leaseTermsData.paymentFrequency,
        currency: leaseTermsData.currency,
        notes: leaseTermsData.notes || null,
      });

      for (const tenantId of tenantIds) {
        await updateTenant({ id: tenantId, userId, leaseId: newLease.id });
        await addToPropertyChannel({ leaseId: newLease.id, tenantId });
      }

      toast({ title: t("success.created") });
      form.reset();
      setStep(1);
      setLeaseTermsData(null);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: t("error.create"),
        description: error instanceof Error ? error.message : t("error.description"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <StepIndicator
        step={step}
        step1Label={wizardT("step1-title")}
        step2Label={wizardT("step2-title")}
      />

      {step === 1 ? (
        <Form {...form}>
          <div className="space-y-5">
            {properties.length === 0 && (
              <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                <p>{wizardT("no-properties-available")}</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/properties">{wizardT("create-property")}</Link>
                </Button>
              </div>
            )}

            <SectionHeader label={t("property")} />
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="sr-only">{t("property")}</FormLabel>
                  <Popover open={propertyOpen} onOpenChange={setPropertyOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={propertyOpen}
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                          disabled={!!propertyId}
                        >
                          {field.value
                            ? properties?.find((p) => p.id === field.value)?.title
                            : t("select-property")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder={t("search-property")} />
                        <CommandList>
                          <CommandEmpty>{t("no-property-found")}</CommandEmpty>
                          <CommandGroup>
                            {properties?.map((p) => (
                              <CommandItem
                                value={`${p.title} ${p.address} ${p.city}`}
                                key={p.id}
                                onSelect={() => {
                                  form.setValue("propertyId", p.id, { shouldValidate: true });
                                  setPropertyOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", p.id === field.value ? "opacity-100" : "opacity-0")} />
                                {p.title}
                                <span className="ml-2 text-muted-foreground text-sm">{p.address}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SectionHeader label={leaseT("section-period")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("start-date")}</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} placeholder={t("select-start-date")} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("end-date.label")}</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} placeholder={t("select-end-date")} />
                    <FormDescription>{t("end-date.description")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SectionHeader label={leaseT("section-financial")} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="rentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-h-5">{t("rent-amount")}</FormLabel>
                    <FormControl>
                      <Input placeholder="1200" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription className="min-h-5 invisible">.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="depositAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-h-5">{t("deposit-amount.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder="1200" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>{t("deposit-amount.description")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-h-5">{t("charges.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder="100" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>{t("charges.description")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SectionHeader label={leaseT("section-configuration")} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="leaseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex min-h-5 items-center gap-1.5">
                      {t("lease-type.label")}
                      <LeaseTypeTooltip />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select-lease-type")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">{t("lease-type.individual")}</SelectItem>
                        <SelectItem value="SHARED">{t("lease-type.shared")}</SelectItem>
                        <SelectItem value="COLOCATION">{t("lease-type.colocation")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-h-5">{t("payment-frequency.label")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select-payment-frequency")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">{t("payment-frequency.monthly")}</SelectItem>
                        <SelectItem value="quarterly">{t("payment-frequency.quarterly")}</SelectItem>
                        <SelectItem value="yearly">{t("payment-frequency.yearly")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-h-5">{leaseT("currency")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="isFurnished"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("furnished.label")}</FormLabel>
                    <FormControl>
                      <div className="flex items-center h-10 gap-2">
                        <Checkbox
                          id="isFurnished"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="isFurnished" className="text-sm text-muted-foreground cursor-pointer">
                          {t("furnished.description")}
                        </label>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("notes.label")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("notes.placeholder")} className="resize-none" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" onClick={handleStep1Next} disabled={properties.length === 0}>
                {wizardT("next")}
              </Button>
            </div>
          </div>
        </Form>
      ) : (
        <TenantAssignmentStep
          leaseType={leaseTermsData?.leaseType ?? "INDIVIDUAL"}
          onBack={() => setStep(1)}
          onSubmit={handleTenantSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
