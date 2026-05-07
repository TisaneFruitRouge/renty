"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updateLease } from "../actions"
import { useTranslations } from "next-intl"
import { useState } from "react"
import type { lease } from "@prisma/client"
import { toast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/ui/date-picker"

const formSchema = z.object({
  startDate: z.date({ required_error: "Veuillez sélectionner une date de début." }),
  endDate: z.date().optional(),
  rentAmount: z.string().min(1, "Le loyer est requis.").refine(val => {
    const num = parseFloat(val);
    return !Number.isNaN(num) && num > 0;
  }, { message: "Le loyer doit être supérieur à 0." }),
  depositAmount: z.string().optional().refine(val => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !Number.isNaN(num) && num >= 0;
  }, { message: "Le dépôt doit être un nombre valide." }),
  charges: z.string().optional().refine(val => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !Number.isNaN(num) && num >= 0;
  }, { message: "Les charges doivent être un nombre valide." }),
  leaseType: z.enum(["INDIVIDUAL", "SHARED", "COLOCATION"] as const, {
    required_error: "Veuillez sélectionner un type de bail.",
  }),
  isFurnished: z.boolean().default(false),
  paymentFrequency: z.enum(["monthly", "quarterly", "yearly"] as const).default("monthly"),
  currency: z.string().default("EUR"),
  notes: z.string().optional(),
})

export type EditLeaseFormData = z.infer<typeof formSchema>

interface EditLeaseFormProps {
  lease: lease
  onSuccess?: () => void
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default function EditLeaseForm({ lease, onSuccess }: EditLeaseFormProps) {
  const t = useTranslations('lease.edit-form')
  const leaseT = useTranslations('lease')
  const createT = useTranslations('lease.create-form')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditLeaseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: new Date(lease.startDate),
      endDate: lease.endDate ? new Date(lease.endDate) : undefined,
      rentAmount: lease.rentAmount.toString(),
      depositAmount: lease.depositAmount ? lease.depositAmount.toString() : "",
      charges: lease.charges ? lease.charges.toString() : "",
      leaseType: lease.leaseType,
      isFurnished: lease.isFurnished,
      paymentFrequency: lease.paymentFrequency as "monthly" | "quarterly" | "yearly",
      currency: lease.currency,
      notes: lease.notes || "",
    },
  })

  async function onSubmit(values: EditLeaseFormData) {
    try {
      setIsSubmitting(true)
      await updateLease(lease.id, {
        startDate: values.startDate,
        endDate: values.endDate,
        rentAmount: parseFloat(values.rentAmount),
        depositAmount: values.depositAmount && values.depositAmount !== "" ? parseFloat(values.depositAmount) : undefined,
        charges: values.charges && values.charges !== "" ? parseFloat(values.charges) : 0,
        leaseType: values.leaseType,
        isFurnished: values.isFurnished,
        paymentFrequency: values.paymentFrequency,
        currency: values.currency,
        notes: values.notes,
      })

      toast({
        title: t("success.updated"),
        description: t("success.description")
      })
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast({
        title: t("error.update"),
        description: t("error.description"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* Période */}
        <SectionHeader label={leaseT('section-period')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{createT('start-date')}</FormLabel>
                <DatePicker value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{createT('end-date.label')}</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={createT('select-end-date')}
                />
                <FormDescription>{createT('end-date.description')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Financier */}
        <SectionHeader label={leaseT('section-financial')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="rentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{createT('rent-amount')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="1500.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{createT('deposit-amount.label')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="3000.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="charges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{createT('charges.label')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="150.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Configuration */}
        <SectionHeader label={leaseT('section-configuration')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="leaseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{createT('lease-type.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={createT('select-lease-type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">{leaseT('type.individual')}</SelectItem>
                    <SelectItem value="SHARED">{leaseT('type.shared')}</SelectItem>
                    <SelectItem value="COLOCATION">{leaseT('type.colocation')}</SelectItem>
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
                <FormLabel>{createT('payment-frequency.label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={createT('select-payment-frequency')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">{leaseT('frequency.monthly')}</SelectItem>
                    <SelectItem value="quarterly">{leaseT('frequency.quarterly')}</SelectItem>
                    <SelectItem value="yearly">{leaseT('frequency.yearly')}</SelectItem>
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
                <FormLabel>{leaseT('currency')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={leaseT('select-currency')} />
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
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 h-10">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">{leaseT('furnished')}</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{leaseT('notes')} <span className="text-muted-foreground font-normal">({leaseT('optional')})</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={leaseT('notes-placeholder')}
                    className="resize-none"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('updating') : t('submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
