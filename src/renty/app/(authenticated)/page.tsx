import PropertiesList from "@/features/properties/components/PropertiesList";
import { getPropertiesForUser } from "@/features/properties/db";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Home as HomeIcon, Users, Euro, Receipt } from "lucide-react";

export default async function Home() {
  const t = await getTranslations('home');

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  const properties = await getPropertiesForUser(session.user.id);

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {session?.user?.name && (
            <h1 className="text-3xl font-bold">
              {t("welcome", { name: session.user.name })} 👋
            </h1>
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total-properties")}
              </CardTitle>
              <HomeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total-tenants")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.filter(p => p.tenants.length > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total-rent")}
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.reduce((acc, p) => acc + ((p.rentDetails as { baseRent: number; })?.baseRent || 0), 0)}€
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total-charges")}
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.reduce((acc, p) => acc + ((p.rentDetails as { charges: number; })?.charges || 0), 0)}€
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PropertiesList properties={properties} />
    </div>
  )
}