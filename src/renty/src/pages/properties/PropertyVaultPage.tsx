import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { ChevronLeft, MapPin } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import Link from "@/components/Link";
import { api } from "@/convex/_generated/api";
import type { document as DocumentType, property } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DocumentVault } from "./vault/DocumentVault";
import { reviveDates } from "../../lib/revive-dates";
import { useCurrentUserId } from "../../lib/current-user";

function LoadingVaultPage() {
  return (
    <div className="p-8">
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-16 w-96 rounded bg-muted" />
        <div className="h-96 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function PropertyVaultPage() {
  const t = useTranslations("documents");
  const { id = "" } = useParams();
  const userId = useCurrentUserId();
  const rawProperty = useQuery(api.properties.getById, id ? { id } : "skip");
  const rawDocuments = useQuery(api.documents.listForProperty, id ? { propertyId: id } : "skip");

  const property = useMemo(() => reviveDates(rawProperty) as property | null | undefined, [rawProperty]);
  const documents = useMemo(
    () => reviveDates(rawDocuments ?? []) as unknown as DocumentType[],
    [rawDocuments],
  );

  if (property === undefined || rawDocuments === undefined) {
    return <LoadingVaultPage />;
  }

  if (!property || (userId && property.userId !== userId)) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <p className="text-muted-foreground">{t("no-documents-found")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/properties/${id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t("back-to-property")}
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {property.title} - {t("document-vault")}
          </h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {property.address}, {property.postalCode} {property.city}
            </span>
          </div>
        </div>
      </div>

      <DocumentVault documents={documents} propertyId={id} />
    </div>
  );
}
