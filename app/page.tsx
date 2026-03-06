// ============================================================
// Dashboard — Página principal de WatchTracker Ecuador
// Server Component: fetching de datos directamente en Supabase
// ============================================================
import { Watch } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getLast6MonthsData, getBrandDistribution } from '@/lib/utils'
import { KPICards } from '@/components/dashboard/KPICards'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { BrandDonut } from '@/components/dashboard/BrandDonut'
import { RecentSalesTable } from '@/components/dashboard/RecentSalesTable'
import type { DashboardKPIs } from '@/lib/types'

// Renderizado dinámico en cada petición (SSR) — requiere Supabase en runtime
export const dynamic = 'force-dynamic'

async function getDashboardData() {
  // Obtener todos los relojes
  const { data: watches, error: watchError } = await supabase
    .from('watches')
    .select('*')
    .order('created_at', { ascending: false })

  if (watchError) {
    console.error('Error al obtener relojes:', watchError)
    return null
  }

  // Obtener todas las ventas con datos del reloj asociado
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*, watches(*)')
    .order('sale_date', { ascending: false })

  if (salesError) {
    console.error('Error al obtener ventas:', salesError)
    return null
  }

  const allWatches = watches || []
  const allSales = sales || []

  // Separar relojes por estado
  const stockWatches = allWatches.filter((w) => w.status === 'en_stock')
  const inTransitWatches = allWatches.filter((w) => w.status === 'en_transito')
  const soldWatches = allWatches.filter((w) => w.status === 'vendido')

  // Ventas del mes actual
  const now = new Date()
  const soldThisMonth = allSales.filter((s) => {
    const d = new Date(s.sale_date + 'T00:00:00')
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Totales financieros
  const stockTotalCost = stockWatches.reduce((acc, w) => acc + Number(w.total_cost_usd), 0)
  const stockTotalSellingPrice = stockWatches.reduce(
    (acc, w) => acc + (w.selling_price_usd ? Number(w.selling_price_usd) : 0),
    0
  )
  const totalRevenue = allSales.reduce((acc, s) => acc + Number(s.sale_price_usd), 0)
  const realizedGain = allSales.reduce((acc, s) => {
    const cost = s.watches?.total_cost_usd ? Number(s.watches.total_cost_usd) : 0
    return acc + (Number(s.sale_price_usd) - cost)
  }, 0)

  const kpis: DashboardKPIs = {
    stockCount: stockWatches.length,
    stockTotalCost,
    stockTotalSellingPrice,
    inTransitCount: inTransitWatches.length,
    soldCount: soldWatches.length,
    soldThisMonth,
    realizedGain,
    totalRevenue,
  }

  return {
    kpis,
    monthlyData: getLast6MonthsData(allSales),
    brandData: getBrandDistribution(stockWatches),
    recentSales: allSales.slice(0, 5),
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Estado vacío si Supabase no está configurado o hay error
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
          <Watch className="w-8 h-8 text-yellow-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Error de conexión con Supabase
          </h2>
          <p className="text-gray-400 text-sm max-w-md">
            Verifica que las variables de entorno{' '}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-yellow-400 text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{' '}
            y{' '}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-yellow-400 text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{' '}
            estén configuradas en tu archivo <code className="bg-gray-800 px-1 rounded text-xs">.env.local</code>.
          </p>
        </div>
      </div>
    )
  }

  const { kpis, monthlyData, brandData, recentSales } = data

  return (
    <div className="space-y-8">
      {/* Header de la página */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
          <Watch className="w-5 h-5 text-gray-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">
            Resumen de tu negocio de relojes en Ecuador
          </p>
        </div>
      </div>

      {/* KPIs */}
      <KPICards kpis={kpis} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Gráfico de barras: ventas por mes (ocupa más espacio) */}
        <div className="lg:col-span-3 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-base font-semibold text-white mb-1">
            Ventas por Mes
          </h2>
          <p className="text-xs text-gray-400 mb-5">Últimos 6 meses — ingresos y ganancia</p>
          <SalesChart data={monthlyData} />
        </div>

        {/* Gráfico de dona: distribución por marca */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-base font-semibold text-white mb-1">
            Stock por Marca
          </h2>
          <p className="text-xs text-gray-400 mb-5">Distribución de relojes en inventario</p>
          <BrandDonut data={brandData} />
        </div>
      </div>

      {/* Últimas ventas */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-base font-semibold text-white mb-5">
          Últimas Ventas
        </h2>
        <RecentSalesTable sales={recentSales} />
      </div>
    </div>
  )
}
