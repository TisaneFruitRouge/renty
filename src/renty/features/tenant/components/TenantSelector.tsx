"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { getAvailableTenants } from "@/features/tenant/actions"
import { useEffect, useState } from "react"
import { tenant } from "@prisma/client"

const formSchema = z.object({
  tenantId: z.string(),
})

interface TenantSelectorProps {
  onSelect: (tenantId: string) => void;
}

export function TenantSelector({ onSelect }: TenantSelectorProps) {
  const t = useTranslations('tenant.selector')
  const [tenants, setTenants] = useState<tenant[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getAvailableTenants().then(setTenants)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onSelect(values.tenantId)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tenantId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('select')}</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
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
                        ? tenants.find((tenant) => tenant.id === field.value)
                          ? `${tenants.find((tenant) => tenant.id === field.value)?.firstName} ${tenants.find((tenant) => tenant.id === field.value)?.lastName}`
                          : t('select-tenant')
                        : t('select-tenant')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t('search-tenant')} />
                    <CommandList>
                      <CommandEmpty>{t('no-tenant-found')}</CommandEmpty>
                      <CommandGroup>
                        {tenants.map((tenant) => (
                          <CommandItem
                            value={tenant.id}
                            key={tenant.id}
                            onSelect={() => {
                              form.setValue("tenantId", tenant.id)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                tenant.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {tenant.firstName} {tenant.lastName}
                            <span className="ml-2 text-muted-foreground">
                              {tenant.email}
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
        <Button type="submit">{t('assign')}</Button>
      </form>
    </Form>
  )
}
