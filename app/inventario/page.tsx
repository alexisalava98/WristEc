// ============================================================
// Inventario — Página de gestión del inventario de relojes
// Server Component: carga inicial de datos desde Supabase
// ============================================================
import { Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { WatchTable } from '@/components/inventory/WatchTable'

// Renderizado dinámico en cada petición (SSR) — requiere Supabase en runtime
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inventario — WatchTracker Ecuador',
}

async function getWatches() {
  const { data, error } = await supabase
    .from('watches')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al obtener inventario:', error)
    return []
  }

  return data || []
}

export default async function InventarioPage() {
  const watches = await getWatches()

  // Estadísticas rápidas del inventario
  const enStock = watches.filter((w) => w.status === 'en_stock').length
  const enTransito = watches.filter((w) => w.status === 'en_transito').length
  const vendidos = watches.filter((w) => w.status === 'vendido').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Inventario</h1>
            <p className="text-sm text-gray-400">
              Gestión de tu colección de relojes
            </p>
          </div>
        </div>

        {/* Resumen rápido de estados */}
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-400">{enStock} en stock</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-400">{enTransito} en tránsito</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-gray-400">{vendidos} vendidos</span>
          </span>
        </div>
      </div>

      {/* Tabla de inventario (Client Component con filtros y modales) */}
      <WatchTable initialWatches={watches} />
    </div>
  )
}
