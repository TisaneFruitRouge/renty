import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import { FileText } from "lucide-react";
import CreateLeaseModal from "@/features/lease/components/CreateLeaseModal";
import LeasesListSearch from "@/features/lease/components/LeasesListSearch";
import {
  PageTitle,
  PageDescription,
  SectionTitle,
} from "@/components/ui/typography";
import { getLeasesForUser } from "@/features/lease/db";
import { getPropertiesForUser } from "@/features/properties/db";

async function getProperties(userId: string) {
  const properties = await getPropertiesForUser(userId);
  return [...properties].sort((a, b) => a.title.localeCompare(b.title));
}

async function getLeases(userId: string) {
  return getLeasesForUser(userId);
}

async function LeasesContent() {
  const t = await getTranslations("leases");
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const leases = await getLeases(session.user.id);
  const properties = await getProperties(session.user.id);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-start">
        <div>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription className="mt-1">{t("subtitle")}</PageDescription>
        </div>
        <CreateLeaseModal properties={properties} />
      </div>

      {/* Leases List */}
      <div>
        {leases.length > 0 ? (
          <LeasesListSearch leases={leases} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <SectionTitle className="mb-2">
                {t("no-leases-title")}
              </SectionTitle>
              <PageDescription className="text-center mb-4 max-w-md">
                {t("no-leases-description")}
              </PageDescription>
              <CreateLeaseModal properties={properties} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function LeasesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 md:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded-md w-1/4"></div>
            <div className="h-4 bg-muted rounded-md w-1/2"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-card-${Date.now()}-${i}`}
                  className="h-24 bg-muted rounded-md"
                ></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-md"></div>
          </div>
        </div>
      }
    >
      <LeasesContent />
    </Suspense>
  );
}
