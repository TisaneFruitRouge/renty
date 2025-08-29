"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "next-intl"

import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { lease, property, tenant } from "@prisma/client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"




import { editTenant } from "../actions"

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

export type EditTenantFormData = z.infer<typeof formSchema>

interface EditTenantFormProps {
  tenant: tenant;
  leases?: (lease & { property: property })[];
  onSuccess?: () => void;
}

export default function EditTenantForm({ tenant, leases = [], onSuccess }: EditTenantFormProps) {
  const t = useTranslations('tenant')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
  })

  async function onSubmit(values: EditTenantFormData) {
    try {
      setLoading(true)
      await editTenant(tenant.id, values);

      toast({
        title: t('edit-form.success'),
      })
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast({
        title: t('edit-form.error'),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
                <FormLabel>{t('create-form.first-name')}</FormLabel>
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
                <FormLabel>{t('create-form.last-name')}</FormLabel>
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
              <FormLabel>{t('create-form.email')}</FormLabel>
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
              <FormLabel>{t('create-form.phone')}</FormLabel>
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
              <FormLabel>{t('create-form.lease')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('create-form.select-lease')} />
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
              <FormLabel>{t('create-form.notes')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('edit-form.submit')}
        </Button>
      </form>
    </Form>
  )
}
