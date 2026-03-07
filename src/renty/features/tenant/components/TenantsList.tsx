'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { Pagination } from "@/components/ui/pagination"
import { useRouter } from "next/navigation"

const PAGE_SIZE = 15

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
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search.trim()) return tenants
    const q = search.toLowerCase()
    return tenants.filter(tenant =>
      `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(q) ||
      tenant.email.toLowerCase().includes(q) ||
      (tenant.property?.title ?? '').toLowerCase().includes(q)
    )
  }, [search, tenants])

  useEffect(() => { setPage(1) }, [search])

  const columns = useMemo<ColumnDef<TenantRow>[]>(() => [
    {
      id: 'name',
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => <SortableHeader column={column} label={t('table-tenant')} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-accent/50 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium text-sm">{row.original.firstName} {row.original.lastName}</div>
            {(row.original.startDate && row.original.startDate.getTime() !== 0) && (
              <div className="text-xs text-muted-foreground tabular-nums">
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
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm">{row.original.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{row.original.phoneNumber || "—"}</span>
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
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <div className="font-medium text-sm">{row.original.property.title}</div>
              <div className="text-xs text-muted-foreground">{row.original.property.address}</div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t("no-property")}</span>
        )
      ),
    },
    {
      id: 'notes',
      header: t('table-notes'),
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate">
          {row.original.notes || <span className="text-muted-foreground/50">—</span>}
        </p>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('table-actions')}</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <EditTenantModal leases={leases} tenant={row.original} />
          <DeleteTenantModal tenant={row.original} />
        </div>
      ),
    },
  ], [t, leases])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  const table = useReactTable({
    data: paginated,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 mt-12 bg-muted/20 border border-border rounded-md p-12 text-center">
        <div className="bg-background p-4 rounded-md border border-border">
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
    <div className="space-y-3">
      {/* Search */}
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
        <>
          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="text-xs uppercase tracking-wide">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/tenants/${row.original.id}`)}
                  >
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

          {/* Footer: count + pagination */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground">
              {t('pagination.showing', {
                from: (page - 1) * PAGE_SIZE + 1,
                to: Math.min(page * PAGE_SIZE, filtered.length),
                total: filtered.length,
              })}
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
