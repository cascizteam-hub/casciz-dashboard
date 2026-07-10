'use client'

import { use, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Search, ShoppingBag } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatusBadge, FulfilmentBadge } from '@/components/orders/OrderStatusBadge'
import EmptyState from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeletons'
import type { FulfilmentStatus, OrderStatus } from '@/types'

interface Props { params: Promise<{ storeId: string }> }

const STATUS_FILTERS: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '',                label: 'All orders' },
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'PAID',            label: 'Paid' },
  { value: 'PROCESSING',      label: 'Processing' },
  { value: 'SHIPPED',         label: 'Shipped' },
  { value: 'DELIVERED',       label: 'Delivered' },
  { value: 'CANCELLED',       label: 'Cancelled' },
]

const FULFILMENT_FILTERS: Array<{ value: FulfilmentStatus | ''; label: string }> = [
  { value: '',             label: 'All' },
  { value: 'UNFULFILLED',  label: 'Unfulfilled' },
  { value: 'SHIPPED',      label: 'Shipped' },
  { value: 'DELIVERED',    label: 'Delivered' },
]

export default function OrdersPage({ params }: Props) {
  const { storeId } = use(params)
  const { orders, totalElements, isLoading, fetchOrders } = useOrders(storeId)

  const [search,          setSearch]          = useState('')
  const [statusFilter,    setStatusFilter]    = useState<OrderStatus | ''>('')
  const [fulfilFilter,    setFulfilFilter]    = useState<FulfilmentStatus | ''>('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    fetchOrders({ q: debouncedSearch || undefined, status: statusFilter || undefined,
      fulfilmentStatus: fulfilFilter || undefined, size: 50 })
  }, [fetchOrders, debouncedSearch, statusFilter, fulfilFilter])

  useEffect(() => { load() }, [load])

  const fmt = (n: number, cur = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(n)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={`/stores/${storeId}`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Store
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm font-medium text-surface-900">Orders</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Orders</h1>
        <p className="text-sm text-surface-500 mt-0.5">
          {totalElements > 0 ? `${totalElements} order${totalElements !== 1 ? 's' : ''}` : 'Manage and fulfil customer orders'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, customers…" className="input pl-9 w-56" />
        </div>
        <select value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="input w-44 text-sm" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={fulfilFilter}
          onChange={(e) => setFulfilFilter(e.target.value as FulfilmentStatus | '')}
          className="input w-40 text-sm" aria-label="Filter by fulfilment">
          {FULFILMENT_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-surface-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32 flex-1" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title={debouncedSearch || statusFilter || fulfilFilter ? 'No orders match your filters' : 'No orders yet'}
            description={debouncedSearch || statusFilter || fulfilFilter
              ? 'Try adjusting your filters.'
              : 'Orders will appear here once customers complete checkout.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Fulfilment</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {orders.map((order) => (
                  <tr key={order.id}
                    className="hover:bg-surface-50 transition-colors cursor-pointer group"
                    onClick={() => window.location.href = `/stores/${storeId}/orders/${order.id}`}>
                    <td className="px-5 py-4">
                      <span className="font-mono font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
                        {order.orderNumber}
                      </span>
                      <p className="text-xs text-surface-400">{order.totalItemCount} item{order.totalItemCount !== 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-surface-900">
                        {order.customerFirstName} {order.customerLastName}
                      </p>
                      <p className="text-xs text-surface-500 truncate max-w-[160px]">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <FulfilmentBadge status={order.fulfilmentStatus} />
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-surface-900">
                      {fmt(order.totalAmount, order.currency)}
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-surface-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
