'use client'

// ============================================================
// WatchTable — Tabla de inventario de relojes
// Client Component: maneja filtros, búsqueda y modales
// ============================================================
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Edit2, ShoppingCart, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { WatchModal } from './WatchModal'
import { SaleModal } from './SaleModal'
import { formatCurrency, formatDate, calcMargin, getStatusBadgeClass, getStatusLabel, cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Watch, WatchStatus, WatchSource } from '@/lib/types'

interface WatchTableProps {
  initialWatches: Watch[]
}

type SortKey = 'brand' | 'total_cost_usd' | 'selling_price_usd' | 'purchase_date' | 'status'
type SortDir = 'asc' | 'desc'

export function WatchTable({ initialWatches }: WatchTableProps) {
  const router = useRouter()

  // Copia local para actualizaciones inmediatas (optimistic UI)
  const [watches, setWatches] = useState<Watch[]>(initialWatches)

  // Re-fetch directo desde Supabase — evita depender de router.refresh() para actualizar UI
  const refreshWatches = useCallback(async () => {
    const { data } = await supabase
      .from('watches')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setWatches(data)
    // router.refresh() actualiza los contadores SSR del encabezado de la página
    router.refresh()
  }, [router])

  // Estados de modales
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editWatch, setEditWatch] = useState<Watch | null>(null)
  const [saleWatch, setSaleWatch] = useState<Watch | null>(null)
  const [deleteWatch, setDeleteWatch] = useState<Watch | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Estados de filtros
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<WatchStatus | 'todos'>('todos')
  const [filterSource, setFilterSource] = useState<WatchSource | 'todos'>('todos')
  const [filterBrand, setFilterBrand] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)

  // Estado de ordenamiento
  const [sortKey, setSortKey] = useState<SortKey>('purchase_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Marcas únicas para el filtro
  const brands = useMemo(() => {
    const set = new Set(watches.map((w) => w.brand))
    return Array.from(set).sort()
  }, [watches])

  // Filtrar y ordenar relojes
  const filteredWatches = useMemo(() => {
    let list = [...watches]

    // Filtro de búsqueda
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        (w) =>
          w.brand.toLowerCase().includes(q) ||
          w.model.toLowerCase().includes(q) ||
          (w.reference?.toLowerCase().includes(q) ?? false)
      )
    }

    // Filtro de estado
    if (filterStatus !== 'todos') {
      list = list.filter((w) => w.status === filterStatus)
    }

    // Filtro de fuente
    if (filterSource !== 'todos') {
      list = list.filter((w) => w.source === filterSource)
    }

    // Filtro de marca
    if (filterBrand !== 'todos') {
      list = list.filter((w) => w.brand === filterBrand)
    }

    // Ordenamiento
    list.sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [watches, search, filterStatus, filterSource, filterBrand, sortKey, sortDir])

  // Alternar ordenamiento al hacer click en columna
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleSuccess = refreshWatches

  // Eliminar reloj confirmado
  async function handleDeleteConfirm() {
    if (!deleteWatch) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      const { error } = await supabase.from('watches').delete().eq('id', deleteWatch.id)
      if (error) throw error
      setDeleteWatch(null)
      await refreshWatches()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el reloj')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Icono de ordenamiento para la columna activa
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-yellow-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-yellow-400" />
    )
  }

  return (
    <div>
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-lg
                       pl-10 pr-4 py-2.5 text-sm placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          />
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
            showFilters
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              : 'border-gray-700 text-gray-400 hover:text-gray-100 hover:border-gray-600'
          )}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {(filterStatus !== 'todos' || filterSource !== 'todos' || filterBrand !== 'todos') && (
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          )}
        </button>

        {/* Botón de agregar reloj */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400
                     text-gray-900 font-semibold text-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Agregar reloj</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Panel de filtros desplegable */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as WatchStatus | 'todos')}
              className={filterSelectClass}
            >
              <option value="todos">Todos los estados</option>
              <option value="en_transito">En Tránsito</option>
              <option value="en_stock">En Stock</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Fuente</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as WatchSource | 'todos')}
              className={filterSelectClass}
            >
              <option value="todos">Todas las fuentes</option>
              <option value="Jomashop">Jomashop</option>
              <option value="Amazon">Amazon</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Marca</label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className={filterSelectClass}
            >
              <option value="todos">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Conteo de resultados */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">
          {filteredWatches.length} reloj{filteredWatches.length !== 1 ? 'es' : ''} encontrado
          {filteredWatches.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tabla de relojes */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/80">
            <tr>
              <th className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap">
                Reloj
              </th>
              <th
                className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap cursor-pointer hover:text-gray-200"
                onClick={() => handleSort('brand')}
              >
                <span className="flex items-center gap-1">Marca <SortIcon col="brand" /></span>
              </th>
              <th className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap">
                Fuente
              </th>
              <th
                className="text-right text-gray-400 font-medium py-3 px-4 whitespace-nowrap cursor-pointer hover:text-gray-200"
                onClick={() => handleSort('total_cost_usd')}
              >
                <span className="flex items-center justify-end gap-1">Costo total <SortIcon col="total_cost_usd" /></span>
              </th>
              <th
                className="text-right text-gray-400 font-medium py-3 px-4 whitespace-nowrap cursor-pointer hover:text-gray-200"
                onClick={() => handleSort('selling_price_usd')}
              >
                <span className="flex items-center justify-end gap-1">P. venta <SortIcon col="selling_price_usd" /></span>
              </th>
              <th className="text-right text-gray-400 font-medium py-3 px-4 whitespace-nowrap">
                Margen
              </th>
              <th
                className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap cursor-pointer hover:text-gray-200"
                onClick={() => handleSort('status')}
              >
                <span className="flex items-center gap-1">Estado <SortIcon col="status" /></span>
              </th>
              <th
                className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap cursor-pointer hover:text-gray-200"
                onClick={() => handleSort('purchase_date')}
              >
                <span className="flex items-center gap-1">Fecha compra <SortIcon col="purchase_date" /></span>
              </th>
              <th className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredWatches.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-500">
                  No se encontraron relojes con los filtros seleccionados
                </td>
              </tr>
            ) : (
              filteredWatches.map((watch) => {
                const cost = Number(watch.total_cost_usd)
                const sp = watch.selling_price_usd ? Number(watch.selling_price_usd) : null
                const margin = sp !== null ? calcMargin(sp, cost) : null

                return (
                  <tr
                    key={watch.id}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Imagen + Modelo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {watch.image_url ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-700 shrink-0">
                            <Image
                              src={watch.image_url}
                              alt={`${watch.brand} ${watch.model}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 border border-gray-700">
                            <span className="text-lg">⌚</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-gray-100 font-medium truncate max-w-[120px]">
                            {watch.model}
                          </p>
                          {watch.reference && (
                            <p className="text-gray-500 text-xs truncate">{watch.reference}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Marca */}
                    <td className="py-3 px-4 text-gray-300 whitespace-nowrap">
                      {watch.brand}
                    </td>

                    {/* Fuente */}
                    <td className="py-3 px-4">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
                        {watch.source}
                      </span>
                    </td>

                    {/* Costo total */}
                    <td className="py-3 px-4 text-right text-gray-300 whitespace-nowrap">
                      <div className="text-xs text-gray-500 mb-0.5">
                        {formatCurrency(Number(watch.purchase_price_usd))} +{' '}
                        {formatCurrency(Number(watch.shipping_cost_usd))} +{' '}
                        {formatCurrency(Number(watch.import_tax_usd))}
                      </div>
                      <span className="font-semibold text-yellow-400">
                        {formatCurrency(cost)}
                      </span>
                    </td>

                    {/* Precio de venta */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {sp !== null ? (
                        <span className="text-gray-100">{formatCurrency(sp)}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Margen */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {margin !== null ? (
                        <span
                          className={cn(
                            'font-semibold',
                            margin >= 20 ? 'text-green-400' :
                            margin >= 0 ? 'text-yellow-400' : 'text-red-400'
                          )}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusBadgeClass(watch.status))}>
                        {getStatusLabel(watch.status)}
                      </span>
                    </td>

                    {/* Fecha de compra */}
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(watch.purchase_date)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Editar */}
                        <button
                          onClick={() => setEditWatch(watch)}
                          className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors"
                          title="Editar reloj"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Registrar venta (solo si está en stock) */}
                        {watch.status === 'en_stock' && (
                          <button
                            onClick={() => setSaleWatch(watch)}
                            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-md transition-colors"
                            title="Registrar venta"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Eliminar (solo si no está vendido) */}
                        {watch.status !== 'vendido' && (
                          <button
                            onClick={() => { setDeleteError(null); setDeleteWatch(watch) }}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Eliminar reloj"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Agregar reloj */}
      <WatchModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Modal: Editar reloj */}
      <WatchModal
        watch={editWatch}
        isOpen={!!editWatch}
        onClose={() => setEditWatch(null)}
        onSuccess={handleSuccess}
      />

      {/* Modal: Registrar venta */}
      <SaleModal
        watch={saleWatch}
        isOpen={!!saleWatch}
        onClose={() => setSaleWatch(null)}
        onSuccess={handleSuccess}
      />

      {/* Modal: Confirmar eliminación */}
      <Dialog.Root
        open={!!deleteWatch}
        onOpenChange={(open) => { if (!open) setDeleteWatch(null) }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <Dialog.Title className="text-base font-semibold text-white">
                Eliminar reloj
              </Dialog.Title>
            </div>

            <p className="text-sm text-gray-300 mb-1">
              ¿Estás seguro de que deseas eliminar este reloj?
            </p>
            {deleteWatch && (
              <p className="text-sm text-gray-500 mb-5">
                {deleteWatch.brand} {deleteWatch.model}
                {deleteWatch.reference ? ` — ${deleteWatch.reference}` : ''}
              </p>
            )}

            {deleteError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteWatch(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300
                           hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500
                           text-white font-semibold text-sm transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

const filterSelectClass = `
  w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2
  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50
`
