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
import type { tenant } from "@prisma/client"
import { useState } from "react"

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
})

export type EditTenantFormData = z.infer<typeof formSchema>

interface EditTenantFormProps {
  tenant: tenant;
  onSuccess?: () => void;
}

export default function EditTenantForm({ tenant, onSuccess }: EditTenantFormProps) {
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
    },
  })

  async function onSubmit(values: EditTenantFormData) {
    try {
      setLoading(true)
      const response = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to update tenant')
      }

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
