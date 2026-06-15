"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "@/lib/i18n";
import { useCurrentUserId } from "../../lib/current-user";
import { ResourceLimitButton } from "../../features/subscription/useResourceLimit";
import { createPropertySchema, type PropertyFormValues } from "./property-schemas";

export default function CreatePropertyModal() {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("property");
  const userId = useCurrentUserId();
  const createProperty = useMutation(api.properties.create);
  const livePropertyCount = useQuery(
    api.properties.countForUser,
    userId ? { userId } : "skip",
  );

  const [loading, setLoading] = useState(false);
  const [propertyCount, setPropertyCount] = useState(0);
  const propertySchema = createPropertySchema(t);

  // Keep the original count state shape while replacing the server action with a live query.
  useEffect(() => {
    if (livePropertyCount !== undefined) {
      setPropertyCount(livePropertyCount);
    }
  }, [livePropertyCount]);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  async function onSubmit(values: PropertyFormValues) {
    try {
      if (!userId) {
        toast({
          variant: "destructive",
          title: t("create-form.error"),
          description: t("create-form.error-authenticated"),
        });
        return;
      }

      setLoading(true);
      const property = await createProperty({
        userId,
        ...values,
      });

      toast({
        title: t("create-form.success"),
        description: property?.title || "",
      });
      router.push(`/properties/${property?.id}`);
    } catch (error) {
      console.error("Form submission error", error);
      toast({
        variant: "destructive",
        title: t("create-form.error"),
        description: error instanceof Error ? error.message : t("create-form.error"),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ResourceLimitButton
          resource="properties"
          count={propertyCount}
          disabledMessage={t("create-form.disabled-message")}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("create-form.open-title")}
        </ResourceLimitButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("create-form.open-title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("create-form.title.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("create-form.title.placeholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("create-form.title.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("create-form.address.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("create-form.address.placeholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("create-form.address.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create-form.city.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("create-form.city.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create-form.state.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("create-form.state.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create-form.country.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("create-form.country.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create-form.postal-code.label")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("create-form.postal-code.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={loading} type="submit" className="w-full">
              {loading && <Loader2 className="animate-spin" />}
              {t("create-form.submit")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
