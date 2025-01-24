import TenantsList from "@/features/tenant/components/TenantsList";
import CreateTenantModal from "@/features/tenant/components/CreateTenantModal";
import { getAllTenants } from "@/features/tenant/actions";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HomeIcon, Euro, Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TenantsPage() {
  const t = await getTranslations('tenants');

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  const tenants = await getAllTenants();

  // Calculate statistics
  const totalTenants = tenants.length;
  const tenantsWithProperty = tenants.filter(t => t.propertyId).length;
  const averageRent = tenants.reduce((acc, t) => {
    if (t.property?.rentDetails) {
      const rent = (t.property.rentDetails as { baseRent: number; charges: number; }).baseRent || 0;
      return acc + rent;
    }
    return acc;
  }, 0) / tenantsWithProperty || 0;

  const uniqueProperties = new Set(tenants.filter(t => t.propertyId).map(t => t.propertyId)).size;

  return (
    <div className="container space-y-8 p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {t("title")}
          </h1>
          <CreateTenantModal />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total-tenants")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTenants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("active-tenants")}
              </CardTitle>
              <HomeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tenantsWithProperty}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("average-rent")}
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(averageRent)}€
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("properties-with-tenants")}
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {uniqueProperties}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TenantsList tenants={tenants} />
    </div>
  )
}
