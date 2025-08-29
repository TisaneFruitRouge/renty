"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { createLease } from "../actions"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { format } from "date-fns"
import type { property } from "@prisma/client"
import { toast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/ui/date-picker"


const formSchema = z.object({
  propertyId: z.string({
    required_error: "Please select a property.",
  }),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  endDate: z.date().optional(),
  rentAmount: z.string().min(1, "Rent amount is required").refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Rent amount must be greater than 0.",
  }),
  depositAmount: z.string().optional().refine(val => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, {
    message: "Deposit amount must be a valid number.",
  }),
  charges: z.string().optional().refine(val => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, {
    message: "Charges must be a valid number.",
  }),
  leaseType: z.enum(["INDIVIDUAL", "SHARED", "COLOCATION"] as const, {
    required_error: "Please select a lease type.",
  }),
  isFurnished: z.boolean().default(false),
  paymentFrequency: z.enum(["monthly", "quarterly", "yearly"] as const).default("monthly"),
  currency: z.string().default("EUR"),
  notes: z.string().optional(),
})

export type CreateLeaseFormData = z.infer<typeof formSchema>

interface CreateLeaseFormProps {
  onSuccess?: () => void
  propertyId?: string
  properties: property[]
}

export default function CreateLeaseForm({ onSuccess, propertyId: initialPropertyId, properties }: CreateLeaseFormProps) {
  const t = useTranslations('lease.create-form')
  const [propertyOpen, setPropertyOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateLeaseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: initialPropertyId || "",
      rentAmount: "",
      depositAmount: "",
      charges: "",
      leaseType: "INDIVIDUAL",
      isFurnished: false,
      paymentFrequency: "monthly",
      currency: "EUR",
      notes: "",
    },
  })

  async function onSubmit(values: CreateLeaseFormData) {
    try {
      setIsSubmitting(true)
      await createLease({
        propertyId: values.propertyId,
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

      form.reset()
      toast({
        title: t("success.created")
      })
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast({
        title: t("error.create"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="propertyId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('property')}</FormLabel>
              <Popover open={propertyOpen} onOpenChange={setPropertyOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={propertyOpen}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={!!initialPropertyId}
                    >
                      {field.value
                        ? properties?.find((property) => property.id === field.value)?.title
                        : t('select-property')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t('search-property')} />
                    <CommandList>
                      <CommandEmpty>{t('no-property-found')}</CommandEmpty>
                      <CommandGroup>
                        {properties?.map((property) => (
                          <CommandItem
                            value={property.id}
                            key={property.id}
                            onSelect={() => {
                              form.setValue("propertyId", property.id)
                              setPropertyOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                property.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {property.title}
                            <span className="ml-2 text-muted-foreground text-sm">
                              {property.address}
                            </span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('start-date')}</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('end-date')} ({t('optional')})</FormLabel>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t('select-end-date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date)
                        setEndDateOpen(false)
                      }}
                      disabled={(date) => {
                        const startDate = form.getValues("startDate")
                        return startDate ? date <= startDate : false
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="rentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('rent-amount')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1500.00"
                    {...field}
                  />
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
                <FormLabel>{t('deposit-amount')} ({t('optional')})</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="3000.00"
                    {...field}
                  />
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
                <FormLabel>{t('charges')} ({t('optional')})</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="150.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="leaseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lease-type')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select-lease-type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">{t('lease-type.individual')}</SelectItem>
                    <SelectItem value="SHARED">{t('lease-type.shared')}</SelectItem>
                    <SelectItem value="COLOCATION">{t('lease-type.colocation')}</SelectItem>
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
                <FormLabel>{t('payment-frequency')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select-payment-frequency')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">{t('frequency.monthly')}</SelectItem>
                    <SelectItem value="quarterly">{t('frequency.quarterly')}</SelectItem>
                    <SelectItem value="yearly">{t('frequency.yearly')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('currency')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select-currency')} />
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

          <FormField
            control={form.control}
            name="isFurnished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('furnished')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('notes')} ({t('optional')})</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('notes-placeholder')}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('creating') : t('create-lease')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
