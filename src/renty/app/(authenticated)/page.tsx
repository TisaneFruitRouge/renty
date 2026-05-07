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
import { PageDescription } from "@/components/ui/typography";
import { TimeGreeting } from "@/components/TimeGreeting";
import { Button } from "@/components/ui/button";
import { RentReceiptStatus } from "@prisma/client"
import { cn } from "@/lib/utils";

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
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-col gap-1">
            {session?.user?.name && (
              <TimeGreeting name={session.user.name} />
            )}
            <PageDescription className="mt-1">
              {allStepsComplete
                ? waitingCount > 0
                  ? t("welcome-subtext-pending", { count: waitingCount })
                  : expiringCount > 0
                    ? t("welcome-subtext-expiring", { count: expiringCount })
                    : t("welcome-subtext-all-good")
                : t("welcome-subtext")}
            </PageDescription>
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
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
              <Link href="/properties" className="group animate-fade-up" style={{ animationDelay: '0ms' }}>
                <Card className="hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("total-properties")}</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground/60" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between pt-1">
                    <div className="text-4xl font-semibold font-display tabular-nums">{properties.length}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tenants" className="group animate-fade-up" style={{ animationDelay: '60ms' }}>
                <Card className="hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("total-tenants")}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground/60" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between pt-1">
                    <div className="text-4xl font-semibold font-display tabular-nums">
                      {properties.filter(p => p.leases.reduce((acc, lease) => acc + lease.tenants.length, 0) > 0).length}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
                  </CardContent>
                </Card>
              </Link>
              <Link href={`/rent-receipts?status=${RentReceiptStatus.PENDING}`} className="group animate-fade-up" style={{ animationDelay: '120ms' }}>
                <Card className="hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("payments-waiting")}</CardTitle>
                    <TriangleAlert className="h-4 w-4 text-muted-foreground/60" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between pt-1">
                    <div className="text-4xl font-semibold font-display tabular-nums">{waitingCount}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/rent-receipts" className="group animate-fade-up" style={{ animationDelay: '180ms' }}>
                <Card className="hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("monthly-revenues")}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between pt-1">
                    <div className="text-3xl font-semibold font-display tabular-nums">{estimatedMonthlyRevenues}€</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
                  </CardContent>
                </Card>
              </Link>
              <Link href="/leases" className="group animate-fade-up" style={{ animationDelay: '240ms' }}>
                <Card className={cn("hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer h-full", expiringCount > 0 && "border-warning")}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("leases-expiring-soon")}</CardTitle>
                    <Clock className={cn("h-4 w-4", expiringCount > 0 ? "text-warning" : "text-muted-foreground/60")} />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between pt-1">
                    <div className={cn("text-4xl font-semibold font-display tabular-nums", expiringCount > 0 && "text-warning-foreground")}>{expiringCount}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
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

  const doneCount = steps.filter(s => s.done).length
  const progressPct = Math.round((doneCount / steps.length) * 100)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full bg-muted/20 border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('getting-started')}</CardTitle>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {t('onboarding-progress', { done: doneCount, total: steps.length })}
            </span>
          </div>
          <CardDescription>{t('complete-steps')}</CardDescription>
          <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-md border",
                  step.done ? "bg-muted/30 opacity-70" : "bg-background"
                )}
              >
                <div className={cn("p-2 rounded-full", step.done ? "bg-success-muted" : "bg-primary/10")}>
                  {step.done
                    ? <CheckCircle2 className="h-5 w-5 text-success" />
                    : <step.icon className="h-5 w-5 text-primary" />
                  }
                </div>
                <div className="flex-1">
                  <h3 className={cn("font-medium", step.done && "line-through text-muted-foreground")}>{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {!step.done && step.action}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick access cards */}
      <Card className="hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow,border-color] duration-200">
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

      <Card className="hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow,border-color] duration-200">
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

      <Card className="hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow,border-color] duration-200">
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
