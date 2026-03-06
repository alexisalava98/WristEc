'use client'

// ============================================================
// VentasContent — Contenido de la página de Ventas
// Client Component: filtros interactivos y resumen
// ============================================================
import { useState, useMemo } from 'react'
import { formatCurrency, formatDate, calcMargin, cn } from '@/lib/utils'
import type { Sale, SalePlatform } from '@/lib/types'

interface VentasContentProps {
  sales: Sale[]
}

const PLATFORMS: (SalePlatform | 'todos')[] = [
  'todos',
  'Facebook Marketplace',
  'Grupo Facebook',
  'Instagram',
  'Presencial',
  'Otro',
]

// Generar los últimos 12 meses para el filtro
function getMonthOptions() {
  const options: { value: string; label: string }[] = [
    { value: 'todos', label: 'Todos los meses' },
  ]
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return options
}

export function VentasContent({ sales }: VentasContentProps) {
  const [filterPlatform, setFilterPlatform] = useState<SalePlatform | 'todos'>('todos')
  const [filterMonth, setFilterMonth] = useState('todos')

  const monthOptions = useMemo(() => getMonthOptions(), [])

  // Filtrar ventas
  const filteredSales = useMemo(() => {
    let result = [...sales]

    if (filterPlatform !== 'todos') {
      result = result.filter((s) => s.platform === filterPlatform)
    }

    if (filterMonth !== 'todos') {
      const [year, month] = filterMonth.split('-').map(Number)
      result = result.filter((s) => {
        const d = new Date(s.sale_date + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
    }

    // Ordenar por fecha descendente
    result.sort((a, b) => b.sale_date.localeCompare(a.sale_date))

    return result
  }, [sales, filterPlatform, filterMonth])

  // Calcular totales del subset filtrado
  const totals = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + Number(s.sale_price_usd), 0)
    const totalCost = filteredSales.reduce(
      (acc, s) => acc + (s.watches?.total_cost_usd ? Number(s.watches.total_cost_usd) : 0),
      0
    )
    const totalProfit = totalRevenue - totalCost
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    return { totalRevenue, totalCost, totalProfit, avgMargin }
  }, [filteredSales])

  return (
    <div>
      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Plataforma</label>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as SalePlatform | 'todos')}
            className={selectClass}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p === 'todos' ? 'Todas las plataformas' : p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Período</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={selectClass}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen de totales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Total recaudado"
          value={formatCurrency(totals.totalRevenue)}
          color="text-blue-400"
        />
        <SummaryCard
          label="Costo total"
          value={formatCurrency(totals.totalCost)}
          color="text-gray-300"
        />
        <SummaryCard
          label="Ganancia total"
          value={formatCurrency(totals.totalProfit)}
          color={totals.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <SummaryCard
          label="Margen promedio"
          value={`${totals.avgMargin.toFixed(1)}%`}
          color={totals.avgMargin >= 20 ? 'text-green-400' : 'text-yellow-400'}
        />
      </div>

      {/* Conteo */}
      <p className="text-sm text-gray-400 mb-3">
        {filteredSales.length} venta{filteredSales.length !== 1 ? 's' : ''} encontrada
        {filteredSales.length !== 1 ? 's' : ''}
      </p>

      {/* Tabla de ventas */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/80">
            <tr>
              <th className="text-left text-gray-400 font-medium py-3 px-4">Reloj</th>
              <th className="text-right text-gray-400 font-medium py-3 px-4 whitespace-nowrap">Costo</th>
              <th className="text-right text-gray-400 font-medium py-3 px-4 whitespace-nowrap">Precio venta</th>
              <th className="text-right text-gray-400 font-medium py-3 px-4 whitespace-nowrap">Ganancia</th>
              <th className="text-right text-gray-400 font-medium py-3 px-4 whitespace-nowrap">Margen</th>
              <th className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap">Plataforma</th>
              <th className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap">Comprador</th>
              <th className="text-left text-gray-400 font-medium py-3 px-4 whitespace-nowrap">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  No hay ventas con los filtros seleccionados
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => {
                const watch = sale.watches
                const cost = watch?.total_cost_usd ? Number(watch.total_cost_usd) : 0
                const salePrice = Number(sale.sale_price_usd)
                const profit = salePrice - cost
                const margin = calcMargin(salePrice, cost)

                return (
                  <tr key={sale.id} className="hover:bg-gray-800/30 transition-colors">
                    {/* Reloj */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-gray-100 font-medium">
                          {watch ? `${watch.brand} ${watch.model}` : '—'}
                        </p>
                        {watch?.reference && (
                          <p className="text-gray-500 text-xs mt-0.5">{watch.reference}</p>
                        )}
                        {watch && (
                          <p className="text-gray-500 text-xs">{watch.source}</p>
                        )}
                      </div>
                    </td>

                    {/* Costo */}
                    <td className="py-3 px-4 text-right text-gray-400 whitespace-nowrap">
                      {cost > 0 ? formatCurrency(cost) : '—'}
                    </td>

                    {/* Precio de venta */}
                    <td className="py-3 px-4 text-right font-semibold text-white whitespace-nowrap">
                      {formatCurrency(salePrice)}
                    </td>

                    {/* Ganancia */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={cn(
                          'font-semibold',
                          profit >= 0 ? 'text-green-400' : 'text-red-400'
                        )}
                      >
                        {formatCurrency(profit)}
                      </span>
                    </td>

                    {/* Margen */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full',
                          margin >= 20
                            ? 'bg-green-500/10 text-green-400'
                            : margin >= 0
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                        )}
                      >
                        {margin.toFixed(1)}%
                      </span>
                    </td>

                    {/* Plataforma */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
                        {sale.platform}
                      </span>
                    </td>

                    {/* Comprador */}
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {sale.buyer_name || <span className="text-gray-600">—</span>}
                    </td>

                    {/* Fecha */}
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(sale.sale_date)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Tarjeta de resumen pequeña
function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={cn('text-lg font-bold', color)}>{value}</p>
    </div>
  )
}

const selectClass = `
  w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2.5
  text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50
`
