"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Loader2, Plus, Check, ChevronsUpDown } from "lucide-react"
import { createLease } from "../actions"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { cn } from "@/lib/utils"

import type { property } from "@prisma/client"
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
    return !Number.isNaN(num) && num > 0;
  }, {
    message: "Rent amount must be greater than 0.",
  }),
  depositAmount: z.string().optional().refine(val => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !Number.isNaN(num) && num >= 0;
  }, {
    message: "Deposit amount must be a valid number.",
  }),
  charges: z.string().optional().refine(val => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !Number.isNaN(num) && num >= 0;
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

interface CreateLeaseModalProps {
  properties: property[]
  propertyId?: string
}

export default function CreateLeaseModal({ properties, propertyId }: CreateLeaseModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const t = useTranslations('lease.create-form');

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [propertyOpen, setPropertyOpen] = useState(false)


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
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
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true);
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
                title: t('success.created'),
                description: t('success.description'),
            });
            setIsOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Form submission error", error)
            toast({
                variant: "destructive",
                title: t('error.create'),
                description: error instanceof Error ? error.message : t('error.description'),
            })
        } finally {
            setLoading(false);
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setTimeout(() => { document.body.style.pointerEvents = '' }, 0)
        }
    }

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
              <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('open-title')}
              </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>{t('open-title')}</DialogTitle>
              </DialogHeader>
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
                                                  disabled={!!propertyId}
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
                                          placeholder={t('select-start-date')}
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
                                      <FormLabel>{t('end-date.label')}</FormLabel>
                                      <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={t('select-end-date')}
                                      />
                                      <FormDescription>{t('end-date.description')}</FormDescription>
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
                                              placeholder="1200"
                                              type="number"
                                              step="0.01"
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
                                      <FormLabel>{t('deposit-amount.label')}</FormLabel>
                                      <FormControl>
                                          <Input
                                              placeholder="1200"
                                              type="number"
                                              step="0.01"
                                              {...field}
                                          />
                                      </FormControl>
                                      <FormDescription>{t('deposit-amount.description')}</FormDescription>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <FormField
                              control={form.control}
                              name="charges"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{t('charges.label')}</FormLabel>
                                      <FormControl>
                                          <Input
                                              placeholder="100"
                                              type="number"
                                              step="0.01"
                                              {...field}
                                          />
                                      </FormControl>
                                      <FormDescription>{t('charges.description')}</FormDescription>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                              control={form.control}
                              name="leaseType"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{t('lease-type.label')}</FormLabel>
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
                                      <FormLabel>{t('payment-frequency.label')}</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                              <SelectTrigger>
                                                  <SelectValue placeholder={t('select-payment-frequency')} />
                                              </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                              <SelectItem value="monthly">{t('payment-frequency.monthly')}</SelectItem>
                                              <SelectItem value="quarterly">{t('payment-frequency.quarterly')}</SelectItem>
                                              <SelectItem value="yearly">{t('payment-frequency.yearly')}</SelectItem>
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
                                  <FormItem>
                                      <FormLabel>{t('furnished.label')}</FormLabel>
                                      <FormControl>
                                          <div className="flex items-center h-10 gap-2">
                                              <Checkbox
                                                  id="isFurnished"
                                                  checked={field.value}
                                                  onCheckedChange={field.onChange}
                                              />
                                              <label htmlFor="isFurnished" className="text-sm text-muted-foreground cursor-pointer">
                                                  {t('furnished.description')}
                                              </label>
                                          </div>
                                      </FormControl>
                                  </FormItem>
                              )}
                          />
                      </div>

                      <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{t('notes.label')}</FormLabel>
                                  <FormControl>
                                      <Textarea
                                          placeholder={t('notes.placeholder')}
                                          className="resize-none"
                                          {...field}
                                      />
                                  </FormControl>
                                  <FormDescription>{t('notes.description')}</FormDescription>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />

                      <Button
                          disabled={loading}
                          type="submit"
                          className="w-full"
                      >
                          {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                          {t('submit')}
                      </Button>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
    )
}
