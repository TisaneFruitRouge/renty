import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageDescription, PageTitle } from "@/components/ui/typography";
import { useTranslations } from "@/lib/i18n";
import CreatePropertyModal from "./CreatePropertyModal";
import PropertiesList from "./PropertiesList";
import { useCurrentUserId } from "../../lib/current-user";

export function PropertiesPage() {
  const t = useTranslations("properties");
  const userId = useCurrentUserId();
  const properties = useQuery(api.properties.listForUser, userId ? { userId } : "skip");

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription className="mt-1">{t("description")}</PageDescription>
        </div>
        <CreatePropertyModal />
      </div>

      <PropertiesList properties={(properties ?? []) as any} />
    </div>
  );
}
