'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Column,
} from '@tanstack/react-table'
import type { property, tenant, lease } from "@prisma/client"
import { Building2, Mail, Phone, Users, ArrowRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import EditTenantModal from "@/features/tenant/components/EditTenantModal"
import DeleteTenantModal from "@/features/tenant/components/DeleteTenantModal"
import CreateTenantModal from "@/features/tenant/components/CreateTenantModal"

type TenantRow = tenant & { property: property | null, startDate: Date | null, endDate: Date | null }

interface TenantsListProps {
  leases: (lease & { property: property })[]
  tenants: TenantRow[]
}

function SortableHeader({ column, label }: { column: Column<TenantRow>, label: string }) {
  const sortDir = column.getIsSorted()
  return (
    <Button variant="ghost" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
      {label}
      {sortDir === 'asc'
        ? <ArrowUp className="ml-2 h-4 w-4" />
        : sortDir === 'desc'
          ? <ArrowDown className="ml-2 h-4 w-4" />
          : <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      }
    </Button>
  )
}

export default function TenantsList({ leases, tenants }: TenantsListProps) {
  const t = useTranslations('tenants')
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const filtered = useMemo(() => {
    if (!search.trim()) return tenants
    const q = search.toLowerCase()
    return tenants.filter(tenant =>
      `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(q) ||
      tenant.email.toLowerCase().includes(q) ||
      (tenant.property?.title ?? '').toLowerCase().includes(q)
    )
  }, [search, tenants])

  const columns = useMemo<ColumnDef<TenantRow>[]>(() => [
    {
      id: 'name',
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => <SortableHeader column={column} label={t('table-tenant')} />,
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-accent/50 flex items-center justify-center">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="ml-4">
            <div className="font-medium">{row.original.firstName} {row.original.lastName}</div>
            {(row.original.startDate && row.original.startDate.getTime() !== 0) && (
              <div className="text-sm text-muted-foreground">
                {row.original.startDate.toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'email',
      accessorFn: row => row.email,
      header: ({ column }) => <SortableHeader column={column} label={t('table-contact')} />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">{row.original.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">{row.original.phoneNumber || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'property',
      accessorFn: row => row.property?.title ?? '',
      header: ({ column }) => <SortableHeader column={column} label={t('table-property')} />,
      cell: ({ row }) => (
        row.original.property ? (
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-muted-foreground mr-2" />
            <div>
              <div className="font-medium">{row.original.property.title}</div>
              <div className="text-sm text-muted-foreground">{row.original.property.address}</div>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t("no-property")}</span>
        )
      ),
    },
    {
      id: 'notes',
      header: t('table-notes'),
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate">
          {row.original.notes || t("no-notes")}
        </p>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('table-actions')}</span>,
      cell: ({ row }) => (
        <div className="flex justify-end space-x-2">
          <EditTenantModal leases={leases} tenant={row.original} />
          <DeleteTenantModal tenant={row.original} />
        </div>
      ),
    },
  ], [t, leases])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 mt-12 bg-muted/20 border border-border rounded-xl p-12 text-center">
        <div className="bg-background p-4 rounded-full shadow-sm border border-border">
          <Users className="h-16 w-16 text-primary" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-semibold">{t("no-tenants-found")}</h2>
          <p className="text-muted-foreground">
            {t("empty-state-description")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <CreateTenantModal leases={leases} />

          <Link href="/properties">
            <Button variant="outline" className="gap-2 w-full">
              {t("manage-properties")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('search-placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>
      {table.getRowModel().rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">{t('no-results')}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
