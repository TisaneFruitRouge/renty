import { z } from "zod";
import { DocumentCategory } from "@/lib/types";

type TFunction = (key: string) => string;

export const documentFormSchema = (t: TFunction) => z.object({
  name: z.string().min(1, t("document-name-required")),
  description: z.string().optional(),
  category: z.nativeEnum(DocumentCategory),
  sharedWithTenant: z.boolean().default(false),
});

export type DocumentFormValues = z.infer<ReturnType<typeof documentFormSchema>>;

export function categoryItems(t: (key: string) => string) {
  return [
    ["LEASE", t("category-lease")],
    ["INVENTORY", t("category-inventory")],
    ["INSURANCE", t("category-insurance")],
    ["MAINTENANCE", t("category-maintenance")],
    ["PAYMENT", t("category-payment")],
    ["CORRESPONDENCE", t("category-correspondence")],
    ["LEGAL", t("category-legal")],
    ["UTILITY", t("category-utility")],
    ["OTHER", t("category-other")],
  ] as const;
}
