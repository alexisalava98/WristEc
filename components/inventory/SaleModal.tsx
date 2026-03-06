'use client'

// ============================================================
// SaleModal — Modal para registrar una venta
// Muestra el costo del reloj y calcula ganancia en tiempo real
// ============================================================
import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, calcMargin, cn } from '@/lib/utils'
import type { Watch, SaleInsert, SalePlatform } from '@/lib/types'

interface SaleModalProps {
  watch: Watch | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const PLATFORMS: SalePlatform[] = [
  'Facebook Marketplace',
  'Grupo Facebook',
  'Instagram',
  'Presencial',
  'Otro',
]

const EMPTY_FORM = {
  sale_price_usd: '',
  sale_date: new Date().toISOString().split('T')[0],
  platform: 'Facebook Marketplace' as SalePlatform,
  buyer_name: '',
  notes: '',
}

export function SaleModal({ watch, isOpen, onClose, onSuccess }: SaleModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Resetear formulario al abrir
  useEffect(() => {
    if (isOpen) {
      setForm({
        ...EMPTY_FORM,
        // Pre-rellenar con precio de venta sugerido si existe
        sale_price_usd: watch?.selling_price_usd?.toString() || '',
      })
      setError(null)
    }
  }, [isOpen, watch])

  const salePrice = parseFloat(form.sale_price_usd) || 0
  const totalCost = watch ? Number(watch.total_cost_usd) : 0
  const profit = salePrice > 0 ? salePrice - totalCost : null
  const margin = profit !== null ? calcMargin(salePrice, totalCost) : null

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!watch) return

    setLoading(true)
    setError(null)

    if (salePrice <= 0) {
      setError('El precio de venta debe ser mayor a 0.')
      setLoading(false)
      return
    }

    const saleData: SaleInsert = {
      watch_id: watch.id,
      sale_price_usd: salePrice,
      sale_date: form.sale_date,
      platform: form.platform,
      buyer_name: form.buyer_name.trim() || null,
      notes: form.notes.trim() || null,
    }

    try {
      // 1. Crear el registro de venta
      const { error: saleErr } = await supabase.from('sales').insert(saleData)
      if (saleErr) throw saleErr

      // 2. Actualizar el estado del reloj a "vendido"
      const { error: watchErr } = await supabase
        .from('watches')
        .update({ status: 'vendido' })
        .eq('id', watch.id)
      if (watchErr) throw watchErr

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar la venta'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" />

        <Dialog.Content
          className={cn(
            'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto',
            'bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl',
            'animate-fade-in'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <Dialog.Title className="text-lg font-semibold text-white">
              Registrar Venta
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Info del reloj que se vende */}
          {watch && (
            <div className="mx-6 mt-5 bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-start gap-4">
                {/* Imagen del reloj (si existe) */}
                {watch.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={watch.image_url}
                    alt={`${watch.brand} ${watch.model}`}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl">⌚</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">
                    {watch.brand} {watch.model}
                  </p>
                  {watch.reference && (
                    <p className="text-gray-400 text-xs mt-0.5">{watch.reference}</p>
                  )}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Costo total:</span>
                      <span className="text-yellow-400 font-semibold ml-1">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                    {watch.selling_price_usd && (
                      <div>
                        <span className="text-gray-400">Precio sugerido:</span>
                        <span className="text-green-400 font-semibold ml-1">
                          {formatCurrency(watch.selling_price_usd)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Precio de venta */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Precio de venta (USD) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sale_price_usd}
                  onChange={(e) => setField('sale_price_usd', e.target.value)}
                  placeholder="0.00"
                  required
                  className={cn(inputClass, 'pl-9')}
                  autoFocus
                />
              </div>
            </div>

            {/* Panel de ganancia en tiempo real */}
            {salePrice > 0 && (
              <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Costo</p>
                    <p className="text-sm font-bold text-gray-300">{formatCurrency(totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Ganancia</p>
                    <p
                      className={cn(
                        'text-sm font-bold',
                        profit !== null && profit >= 0 ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {profit !== null ? formatCurrency(profit) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Margen</p>
                    <p
                      className={cn(
                        'text-sm font-bold',
                        margin !== null && margin >= 0 ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {margin !== null ? `${margin.toFixed(1)}%` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fecha de venta */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Fecha de venta <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.sale_date}
                onChange={(e) => setField('sale_date', e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Plataforma */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Plataforma de venta <span className="text-red-400">*</span>
              </label>
              <select
                value={form.platform}
                onChange={(e) => setField('platform', e.target.value)}
                className={inputClass}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Nombre del comprador */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Nombre del comprador (opcional)
              </label>
              <input
                type="text"
                value={form.buyer_name}
                onChange={(e) => setField('buyer_name', e.target.value)}
                placeholder="Nombre del cliente..."
                className={inputClass}
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Notas (opcional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                rows={2}
                placeholder="Detalles de la venta, método de pago, etc."
                className={cn(inputClass, 'resize-none')}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300
                           hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-400
                           text-gray-900 font-semibold text-sm transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar Venta'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const inputClass = `
  w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2.5
  text-sm placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
  transition-colors
`
