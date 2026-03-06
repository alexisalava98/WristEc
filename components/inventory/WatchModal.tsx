'use client'

// ============================================================
// WatchModal — Modal para agregar o editar un reloj
// Muestra cálculos de costo total y margen en tiempo real
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Calculator } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'
import type { Watch, WatchInsert, WatchSource, WatchStatus } from '@/lib/types'

interface WatchModalProps {
  watch?: Watch | null     // null = modo agregar, Watch = modo editar
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void    // Se llama para refrescar los datos
}

// Marcas comunes de relojes
const BRANDS = [
  'Casio', 'Seiko', 'Citizen', 'Orient', 'Tissot', 'Hamilton',
  'Invicta', 'Bulova', 'Fossil', 'Luminox', 'Nautica', 'Autre',
]

const SOURCES: WatchSource[] = ['Jomashop', 'Amazon', 'Otro']
const STATUSES: { value: WatchStatus; label: string }[] = [
  { value: 'en_transito', label: 'En Tránsito' },
  { value: 'en_stock', label: 'En Stock' },
]

// Estado inicial del formulario (para reloj nuevo)
const EMPTY_FORM = {
  brand: '',
  model: '',
  reference: '',
  source: 'Jomashop' as WatchSource,
  purchase_price_usd: '',
  shipping_cost_usd: '0',
  import_tax_usd: '0',
  selling_price_usd: '',
  status: 'en_transito' as WatchStatus,
  purchase_date: new Date().toISOString().split('T')[0],
  arrival_date: '',
  notes: '',
  image_url: '',
}

export function WatchModal({ watch, isOpen, onClose, onSuccess }: WatchModalProps) {
  const isEditing = !!watch
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado del formulario
  const [form, setForm] = useState(EMPTY_FORM)

  // Cuando se abre el modal con un reloj existente, pre-rellenar el formulario
  useEffect(() => {
    if (watch) {
      setForm({
        brand: watch.brand,
        model: watch.model,
        reference: watch.reference || '',
        source: watch.source,
        purchase_price_usd: watch.purchase_price_usd.toString(),
        shipping_cost_usd: watch.shipping_cost_usd.toString(),
        import_tax_usd: watch.import_tax_usd.toString(),
        selling_price_usd: watch.selling_price_usd?.toString() || '',
        status: watch.status === 'vendido' ? 'en_stock' : watch.status,
        purchase_date: watch.purchase_date,
        arrival_date: watch.arrival_date || '',
        notes: watch.notes || '',
        image_url: watch.image_url || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError(null)
  }, [watch, isOpen])

  // Cálculos en tiempo real
  const purchasePrice = parseFloat(form.purchase_price_usd) || 0
  const shippingCost = parseFloat(form.shipping_cost_usd) || 0
  const importTax = parseFloat(form.import_tax_usd) || 0
  const totalCost = purchasePrice + shippingCost + importTax
  const sellingPrice = parseFloat(form.selling_price_usd) || 0
  const profit = sellingPrice > 0 ? sellingPrice - totalCost : null
  const margin = profit !== null && totalCost > 0 ? (profit / totalCost) * 100 : null

  // Actualizar campo del formulario
  const setField = useCallback((key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Guardar reloj
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validación básica
    if (!form.brand || !form.model || !form.purchase_date) {
      setError('Marca, modelo y fecha de compra son obligatorios.')
      setLoading(false)
      return
    }
    if (purchasePrice <= 0) {
      setError('El precio de compra debe ser mayor a 0.')
      setLoading(false)
      return
    }

    const watchData: WatchInsert = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      reference: form.reference.trim() || null,
      source: form.source,
      purchase_price_usd: purchasePrice,
      shipping_cost_usd: shippingCost,
      import_tax_usd: importTax,
      selling_price_usd: sellingPrice > 0 ? sellingPrice : null,
      status: form.status,
      purchase_date: form.purchase_date,
      arrival_date: form.arrival_date || null,
      notes: form.notes.trim() || null,
      image_url: form.image_url.trim() || null,
    }

    try {
      if (isEditing && watch) {
        // Actualizar reloj existente
        const { error: supaErr } = await supabase
          .from('watches')
          .update(watchData)
          .eq('id', watch.id)

        if (supaErr) throw supaErr
      } else {
        // Insertar reloj nuevo
        const { error: supaErr } = await supabase.from('watches').insert(watchData)
        if (supaErr) throw supaErr
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el reloj'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay oscuro con blur */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" />

        {/* Contenido del modal */}
        <Dialog.Content
          className={cn(
            'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto',
            'bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl',
            'animate-fade-in'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <Dialog.Title className="text-lg font-semibold text-white">
              {isEditing ? 'Editar Reloj' : 'Agregar Reloj'}
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

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Fila 1: Marca y Modelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Marca <span className="text-red-400">*</span>
                </label>
                {/* Datalist para sugerencias sin bloquear escritura libre */}
                <input
                  type="text"
                  list="brands-list"
                  value={form.brand}
                  onChange={(e) => setField('brand', e.target.value)}
                  placeholder="ej: Seiko, Tissot..."
                  required
                  className={inputClass}
                />
                <datalist id="brands-list">
                  {BRANDS.map((b) => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Modelo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setField('model', e.target.value)}
                  placeholder="ej: SKX007, PRX..."
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Fila 2: Referencia y Fuente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Referencia (opcional)
                </label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setField('reference', e.target.value)}
                  placeholder="ej: SRPD51K1"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Fuente <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.source}
                  onChange={(e) => setField('source', e.target.value)}
                  className={inputClass}
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 3: Costos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Precio compra (USD) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.purchase_price_usd}
                  onChange={(e) => setField('purchase_price_usd', e.target.value)}
                  placeholder="0.00"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Envío courier (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shipping_cost_usd}
                  onChange={(e) => setField('shipping_cost_usd', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Impuestos/Aranceles (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.import_tax_usd}
                  onChange={(e) => setField('import_tax_usd', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Fila 4: Precio de venta y Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Precio de venta (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.selling_price_usd}
                  onChange={(e) => setField('selling_price_usd', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  className={inputClass}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 5: Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Fecha de compra <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) => setField('purchase_date', e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Fecha de llegada (opcional)
                </label>
                <input
                  type="date"
                  value={form.arrival_date}
                  onChange={(e) => setField('arrival_date', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* URL de imagen */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                URL de imagen (opcional)
              </label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setField('image_url', e.target.value)}
                placeholder="https://..."
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
                placeholder="Condición, detalles de la compra, etc."
                className={cn(inputClass, 'resize-none')}
              />
            </div>

            {/* Panel de cálculos en tiempo real */}
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Resumen de costos
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <CalcItem
                  label="Costo Total"
                  value={formatCurrency(totalCost)}
                  highlight={false}
                />
                <CalcItem
                  label="Ganancia"
                  value={profit !== null ? formatCurrency(profit) : '—'}
                  highlight={profit !== null}
                  positive={profit !== null && profit >= 0}
                />
                <CalcItem
                  label="Margen"
                  value={margin !== null ? `${margin.toFixed(1)}%` : '—'}
                  highlight={margin !== null}
                  positive={margin !== null && margin >= 0}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Botones de acción */}
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
                className="flex-1 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400
                           text-gray-900 font-semibold text-sm transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Agregar reloj'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Componente auxiliar para los ítems del panel de cálculos
function CalcItem({
  label,
  value,
  highlight,
  positive,
}: {
  label: string
  value: string
  highlight: boolean
  positive?: boolean
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={cn(
          'text-sm font-bold',
          !highlight && 'text-gray-300',
          highlight && positive && 'text-green-400',
          highlight && !positive && 'text-red-400'
        )}
      >
        {value}
      </p>
    </div>
  )
}

// Clase reutilizable para los inputs del formulario
const inputClass = `
  w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2.5
  text-sm placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
  transition-colors
`
