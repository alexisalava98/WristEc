// ============================================================
// Ventas — Página de historial de ventas
// Server Component: carga inicial de datos desde Supabase
// ============================================================
import { ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { VentasContent } from '@/components/ventas/VentasContent'
import { formatCurrency } from '@/lib/utils'

// Renderizado dinámico en cada petición (SSR) — requiere Supabase en runtime
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Ventas — WatchTracker Ecuador',
}

async function getSales() {
  const { data, error } = await supabase
    .from('sales')
    .select('*, watches(*)')
    .order('sale_date', { ascending: false })

  if (error) {
    console.error('Error al obtener ventas:', error)
    return []
  }

  return data || []
}

export default async function VentasPage() {
  const sales = await getSales()

  // Calcular estadísticas históricas totales para el header
  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.sale_price_usd), 0)
  const totalCost = sales.reduce(
    (acc, s) => acc + (s.watches?.total_cost_usd ? Number(s.watches.total_cost_usd) : 0),
    0
  )
  const totalProfit = totalRevenue - totalCost

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <ShoppingCart className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Ventas</h1>
            <p className="text-sm text-gray-400">
              Historial completo de {sales.length} venta{sales.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Estadísticas globales en el header */}
        {sales.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="text-gray-400 text-xs">Total recaudado</p>
              <p className="text-blue-400 font-semibold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-right">
              <p className="text-gray-400 text-xs">Ganancia total</p>
              <p className={`font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contenido con filtros y tabla (Client Component) */}
      <VentasContent sales={sales} />
    </div>
  )
}
