import { calculateMonthlyRevenue, getPropertiesForUser } from "@/features/properties/db";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Home as HomeIcon, Users, TriangleAlert, TrendingUp } from "lucide-react";
import { countWaitingReceiptsForUser, getReceiptsOfUser } from "@/features/rent-receipt/db";
import MostRecentRentReceipts from "@/features/rent-receipt/components/MostRecentRentReceipts";

export default async function Home() {
  const t = await getTranslations('home');

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  const properties = await getPropertiesForUser(session.user.id);
  const waitingCount = await countWaitingReceiptsForUser(session.user.id);
  const estimatedMonthlyRevenues = await calculateMonthlyRevenue(session.user.id);
  const threeMostRecentReceipts = await getReceiptsOfUser(session.user.id, 3);

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {session?.user?.name && (
              <h1 className="text-2xl font-bold">
                {t("welcome", { name: session.user.name })}
              </h1>
            )}
            <p className="text-muted-foreground">
              {t("welcome-subtext")}
            </p>
          </div>
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
                {t("payments-waiting")}
              </CardTitle>
              <TriangleAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {waitingCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("monthly-revenues")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estimatedMonthlyRevenues}€
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MostRecentRentReceipts 
        receipts={threeMostRecentReceipts}
      />
    </div>
  )
}