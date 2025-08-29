import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/prisma/db"
import { Card, CardContent } from "@/components/ui/card"


import { FileText } from "lucide-react"
import CreateLeaseModal from "@/features/lease/components/CreateLeaseModal"
import LeaseCard from "@/features/lease/components/LeaseCard"

async function getProperties(userId: string) {
  return prisma.property.findMany({
    where: {
      userId
    },
    orderBy: {
      title: 'asc'
    }
  })
}

async function getLeases(userId: string) {
  return prisma.lease.findMany({
    where: {
      property: {
        userId
      }
    },
    include: {
      property: true,
      tenants: {
        include: {
          auth: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

async function LeasesContent() {
  const t = await getTranslations('leases')
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  const leases = await getLeases(session.user.id)
  const properties = await getProperties(session.user.id)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
        <CreateLeaseModal properties={properties} />
      </div>

      {/* Leases List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('all-leases')}</h2>
        {leases.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {leases.map((lease) => (
              <LeaseCard key={lease.id} lease={lease} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('no-leases-title')}</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                {t('no-leases-description')}
              </p>
              <CreateLeaseModal properties={properties} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function LeasesPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-card-${Date.now()}-${i}`} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    }>
      <LeasesContent />
    </Suspense>
  )
}
