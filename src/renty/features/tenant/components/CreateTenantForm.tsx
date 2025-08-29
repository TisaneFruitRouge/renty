"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createTenant } from "../actions"
import { useTranslations } from "next-intl"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import type { lease, property } from "@prisma/client"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  notes: z.string().optional(),
  leaseId: z.string({
    required_error: "Please select a lease.",
  }),
})

export type CreateTenantFormData = z.infer<typeof formSchema>

interface CreateTenantFormProps {
  onSuccess?: () => void
  leaseId?: string
  leases?: (lease & { property: property })[]
}

export default function CreateTenantForm({ onSuccess, leaseId: initialLeaseId, leases }: CreateTenantFormProps) {
  const t = useTranslations('tenant.create-form')
  const [open, setOpen] = useState(false)

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
  })

  async function onSubmit(values: CreateTenantFormData) {
    try {
      await createTenant(values)
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
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('first-name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('first-name-placeholder')} {...field} />
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
              <FormLabel>{t('last-name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('last-name-placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('email-placeholder')} {...field} />
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
              <FormLabel>{t('phone')}</FormLabel>
              <FormControl>
                <Input placeholder={t('phone-placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="leaseId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('lease')}</FormLabel>
              <Popover open={open} onOpenChange={setOpen} modal>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? leases?.find((lease) => lease.id === field.value)?.property.title
                        : t('select-lease')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t('search-lease')} />
                    <CommandList>
                      <CommandEmpty>{t('no-lease-found')}</CommandEmpty>
                      <CommandGroup>
                        {leases?.map((lease) => (
                          <CommandItem
                            value={lease.id}
                            key={lease.id}
                            onSelect={() => {
                              form.setValue("leaseId", lease.id)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                lease.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {lease.property.title}
                            <span className="ml-2 text-muted-foreground">
                              {lease.property.address}
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
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('notes')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('notes-placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{t('submit')}</Button>
      </form>
    </Form>
  )
}
