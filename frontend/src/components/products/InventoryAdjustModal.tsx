'use client'

import { useState } from 'react'
import { X, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import type { VariantResponse } from '@/types'

interface Props {
  variant:    VariantResponse
  onConfirm:  (variantId: string, delta: number) => Promise<void>
  onClose:    () => void
}

export default function InventoryAdjustModal({ variant, onConfirm, onClose }: Props) {
  const [delta,    setDelta]    = useState(0)
  const [reason,   setReason]   = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const currentQty = variant.inventoryQuantity ?? 0
  const newQty     = Math.max(0, currentQty + delta)

  const handleConfirm = async () => {
    if (delta === 0) return
    setIsLoading(true)
    try {
      await onConfirm(variant.id, delta)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-surface-0 shadow-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-surface-900">Adjust inventory</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-surface-600 mb-1">Variant</p>
            <p className="text-sm font-semibold text-surface-900">{variant.title}</p>
            {variant.sku && <p className="text-xs text-surface-500">SKU: {variant.sku}</p>}
          </div>

          <div className="flex items-center justify-between bg-surface-50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-xs text-surface-500">Current</p>
              <p className="text-2xl font-bold text-surface-900">{currentQty}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-surface-500">Adjustment</p>
              <p className={`text-xl font-bold ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-surface-400'}`}>
                {delta > 0 ? '+' : ''}{delta}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-surface-500">New qty</p>
              <p className="text-2xl font-bold text-primary-600">{newQty}</p>
            </div>
          </div>

          <div>
            <label className="label">Quantity change</label>
            <div className="flex items-center gap-2">
              <button type="button"
                onClick={() => setDelta((d) => d - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-100 transition-colors flex-shrink-0">
                <TrendingDown className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
                className="input text-center font-semibold"
              />
              <button type="button"
                onClick={() => setDelta((d) => d + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-100 transition-colors flex-shrink-0">
                <TrendingUp className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="label">Reason <span className="text-xs font-normal text-surface-400">(optional)</span></label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Stock count, return, damage"
              className="input text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={delta === 0 || isLoading}
            className="btn-primary disabled:opacity-50"
          >
            {isLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
              : 'Update stock'}
          </button>
        </div>
      </div>
    </div>
  )
}
