'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import LeaseCard from './LeaseCard'
import type { lease, property, tenant, tenantAuth } from '@prisma/client'

type LeaseWithDetails = lease & {
  property: property
  tenants: (tenant & { auth: tenantAuth | null })[]
}

interface LeasesListSearchProps {
  leases: LeaseWithDetails[]
}

export default function LeasesListSearch({ leases }: LeasesListSearchProps) {
  const t = useTranslations('leases')
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? leases.filter(lease =>
        lease.property.title.toLowerCase().includes(search.toLowerCase()) ||
        lease.property.city.toLowerCase().includes(search.toLowerCase()) ||
        lease.tenants.some(tenant =>
          `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(search.toLowerCase())
        )
      )
    : leases

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('search-placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">{t('no-results')}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(lease => (
            <LeaseCard key={lease.id} lease={lease} />
          ))}
        </div>
      )}
    </div>
  )
}
