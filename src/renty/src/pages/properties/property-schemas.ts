import { z } from "zod";

type TFunction = (key: string) => string;

export const createPropertySchema = (t: TFunction) => z.object({
  title: z.string().min(3, t("create-form.validation.title")),
  address: z.string().min(5, t("create-form.validation.address")),
  city: z.string().min(2, t("create-form.validation.city")),
  state: z.string().min(2, t("create-form.validation.state")),
  country: z.string().min(2, t("create-form.validation.country")),
  postalCode: z.string().min(4, t("create-form.validation.postal-code")),
});

export const updatePropertySchema = createPropertySchema;

export type PropertyFormValues = z.infer<ReturnType<typeof createPropertySchema>>;
