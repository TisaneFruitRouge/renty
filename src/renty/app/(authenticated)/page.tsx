import { calculateMonthlyRevenue, getPropertiesForUser } from "@/features/properties/db";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, TriangleAlert, TrendingUp, Building2, Plus, ArrowRight, ImagePlus, UserPlus, ReceiptText } from "lucide-react";
import { countWaitingReceiptsForUser, getReceiptsOfUser } from "@/features/rent-receipt/db";
import MostRecentRentReceipts from "@/features/rent-receipt/components/MostRecentRentReceipts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RentReceiptStatus } from "@prisma/client";

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
  
  // Check if user has no properties (new user)
  const isNewUser = properties.length === 0;

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
          
          {/* Quick action button for adding property */}
          {isNewUser && (
            <Link href="/properties">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("add-first-property")}
              </Button>
            </Link>
          )}
        </div>
        
        {isNewUser ? (
          <OnboardingSection />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("total-properties")}
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{properties.length}</div>
                </CardContent>
                <CardFooter className="pt-0 pb-2">
                  <Link href="/properties" className="text-xs text-primary flex items-center gap-1 hover:underline">
                    {t("view-all")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardFooter>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-200">
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
                <CardFooter className="pt-0 pb-2">
                  <Link href="/tenants" className="text-xs text-primary flex items-center gap-1 hover:underline">
                    {t("view-all")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardFooter>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-200">
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
                <CardFooter className="pt-0 pb-2">
                  <Link href={`/rent-receipts?status=${RentReceiptStatus.PENDING}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
                    {t("view-pending")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardFooter>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-200">
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
                <CardFooter className="pt-0 pb-2">
                  <Link href="/rent-receipts" className="text-xs text-primary flex items-center gap-1 hover:underline">
                    {t("view-receipts")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            {/* Recent Activity */}
            {threeMostRecentReceipts.length > 0 ? (
              <MostRecentRentReceipts receipts={threeMostRecentReceipts} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('recent-activity')}</CardTitle>
                  <CardDescription>{t('no-recent-activity')}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <Link href="/rent-receipts/create">
                    <Button variant="outline" className="gap-2">
                      <ReceiptText className="h-4 w-4" />
                      {t('create-first-receipt')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Onboarding component for new users
async function OnboardingSection() {
  
  const t = await getTranslations('home');

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full bg-muted/20 border">
        <CardHeader>
          <CardTitle>{t('getting-started')}</CardTitle>
          <CardDescription>{t('complete-steps')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-background rounded-lg shadow-sm border border-border">
              <div className="bg-primary/10 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{t('step-1-title')}</h3>
                <p className="text-sm text-muted-foreground">{t('step-1-description')}</p>
                <Link href="/properties" className="mt-2 inline-block">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3 w-3" />
                    {t('add-property')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-background rounded-lg shadow-sm border border-border">
              <div className="bg-primary/10 p-2 rounded-full">
                <ImagePlus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{t('step-2-title')}</h3>
                <p className="text-sm text-muted-foreground">{t('step-2-description')}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-background rounded-lg shadow-sm border border-border">
              <div className="bg-primary/10 p-2 rounded-full">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{t('step-3-title')}</h3>
                <p className="text-sm text-muted-foreground">{t('step-3-description')}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-background rounded-lg shadow-sm border border-border">
              <div className="bg-primary/10 p-2 rounded-full">
                <ReceiptText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{t('step-4-title')}</h3>
                <p className="text-sm text-muted-foreground">{t('step-4-description')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick access cards */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t('manage-properties')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('properties-description')}</p>
        </CardContent>
        <CardFooter>
          <Link href="/properties" className="w-full">
            <Button variant="outline" className="w-full">{t('go-to-properties')}</Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('manage-tenants')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('tenants-description')}</p>
        </CardContent>
        <CardFooter>
          <Link href="/tenants" className="w-full">
            <Button variant="outline" className="w-full">{t('go-to-tenants')}</Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-primary" />
            {t('manage-receipts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('receipts-description')}</p>
        </CardContent>
        <CardFooter>
          <Link href="/rent-receipts" className="w-full">
            <Button variant="outline" className="w-full">{t('go-to-receipts')}</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}