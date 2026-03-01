import { calculateMonthlyRevenue, getPropertiesForUser } from "@/features/properties/db";
import { getSession } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Users, TriangleAlert, TrendingUp, Building2, Plus, ArrowRight, ImagePlus, UserPlus, ReceiptText, CheckCircle2, Clock } from "lucide-react";
import { countWaitingReceiptsForUser, getReceiptsOfUser } from "@/features/rent-receipt/db";
import { countExpiringLeasesForUser } from "@/features/lease/db";
import MostRecentRentReceipts from "@/features/rent-receipt/components/MostRecentRentReceipts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RentReceiptStatus } from "@prisma/client";

export default async function Home() {
  const t = await getTranslations('home');

  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const [properties, waitingCount, estimatedMonthlyRevenues, threeMostRecentReceipts, expiringCount] = await Promise.all([
    getPropertiesForUser(session.user.id),
    countWaitingReceiptsForUser(session.user.id),
    calculateMonthlyRevenue(session.user.id),
    getReceiptsOfUser(session.user.id, 3),
    countExpiringLeasesForUser(session.user.id, 30),
  ]);

  // Onboarding step completion
  const hasProperties = properties.length > 0
  const hasPhotos = properties.some(p => Array.isArray(p.images) && (p.images as unknown[]).length > 0)
  const hasTenants = properties.some(p => p.leases.some(l => l.tenants.length > 0))
  const hasReceipts = threeMostRecentReceipts.length > 0
  const allStepsComplete = hasProperties && hasPhotos && hasTenants && hasReceipts

  const isNewUser = !hasProperties;

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

        {!allStepsComplete ? (
          <OnboardingSection
            hasProperties={hasProperties}
            hasPhotos={hasPhotos}
            hasTenants={hasTenants}
            hasReceipts={hasReceipts}
          />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Link href="/properties" className="group">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("total-properties")}</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div className="text-2xl font-bold">{properties.length}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tenants" className="group">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("total-tenants")}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div className="text-2xl font-bold">
                      {properties.filter(p => p.leases.reduce((acc, lease) => acc + lease.tenants.length, 0) > 0).length}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
              <Link href={`/rent-receipts?status=${RentReceiptStatus.PENDING}`} className="group">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("payments-waiting")}</CardTitle>
                    <TriangleAlert className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div className="text-2xl font-bold">{waitingCount}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/rent-receipts" className="group">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("monthly-revenues")}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div className="text-2xl font-bold">{estimatedMonthlyRevenues}€</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/leases" className="group">
                <Card className={`hover:shadow-md transition-shadow duration-200 cursor-pointer h-full ${expiringCount > 0 ? 'border-yellow-300 dark:border-yellow-700' : ''}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("leases-expiring-soon")}</CardTitle>
                    <Clock className={`h-4 w-4 ${expiringCount > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div className={`text-2xl font-bold ${expiringCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>{expiringCount}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
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
interface OnboardingSectionProps {
  hasProperties: boolean
  hasPhotos: boolean
  hasTenants: boolean
  hasReceipts: boolean
}

async function OnboardingSection({ hasProperties, hasPhotos, hasTenants, hasReceipts }: OnboardingSectionProps) {
  const t = await getTranslations('home');

  const steps = [
    {
      done: hasProperties,
      icon: Building2,
      title: t('step-1-title'),
      description: t('step-1-description'),
      action: (
        <Link href="/properties" className="mt-2 inline-block">
          <Button size="sm" className="gap-1">
            <Plus className="h-3 w-3" />
            {t('add-property')}
          </Button>
        </Link>
      ),
    },
    {
      done: hasPhotos,
      icon: ImagePlus,
      title: t('step-2-title'),
      description: t('step-2-description'),
    },
    {
      done: hasTenants,
      icon: UserPlus,
      title: t('step-3-title'),
      description: t('step-3-description'),
    },
    {
      done: hasReceipts,
      icon: ReceiptText,
      title: t('step-4-title'),
      description: t('step-4-description'),
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full bg-muted/20 border">
        <CardHeader>
          <CardTitle>{t('getting-started')}</CardTitle>
          <CardDescription>{t('complete-steps')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-4 rounded-lg shadow-sm border ${step.done ? 'bg-muted/30 border-border opacity-70' : 'bg-background border-border'}`}
              >
                <div className={`p-2 rounded-full ${step.done ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
                  {step.done
                    ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    : <step.icon className="h-5 w-5 text-primary" />
                  }
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${step.done ? 'line-through text-muted-foreground' : ''}`}>{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {!step.done && step.action}
                </div>
              </div>
            ))}
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
