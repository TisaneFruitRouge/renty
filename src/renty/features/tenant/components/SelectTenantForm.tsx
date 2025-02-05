"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { assignTenantToProperty } from "../actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { tenant } from "@prisma/client"

const formSchema = z.object({
  tenantId: z.string({
    required_error: "Please select a tenant",
  }),
})

interface SelectTenantFormProps {
  propertyId: string
  availableTenants: tenant[]
  onSuccess?: () => void
}

export function SelectTenantForm({ propertyId, availableTenants, onSuccess }: SelectTenantFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('tenants')
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      await assignTenantToProperty(propertyId, values.tenantId)
      toast({
        title: t('select-form.success'),
      })
      router.refresh()
      onSuccess?.()
    } catch  {
      toast({
        title: t('select-form.error'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tenantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('select-form.tenant-label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select-form.tenant-placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {t('select-form.submit')}
        </Button>
      </form>
    </Form>
  )
}
