// ============================================================
// RecentSalesTable — Tabla de las últimas 5 ventas
// Server Component: recibe datos como props
// ============================================================
import { formatCurrency, formatDate, calcMargin } from '@/lib/utils'
import type { Sale } from '@/lib/types'

interface RecentSalesTableProps {
  sales: Sale[]
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  if (!sales.length) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No hay ventas registradas aún
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left text-gray-400 font-medium py-3 pr-4">Reloj</th>
            <th className="text-right text-gray-400 font-medium py-3 px-4">Costo</th>
            <th className="text-right text-gray-400 font-medium py-3 px-4">Venta</th>
            <th className="text-right text-gray-400 font-medium py-3 px-4">Ganancia</th>
            <th className="text-left text-gray-400 font-medium py-3 pl-4">Plataforma</th>
            <th className="text-left text-gray-400 font-medium py-3 pl-4">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {sales.map((sale) => {
            const watch = sale.watches
            const cost = watch?.total_cost_usd ? Number(watch.total_cost_usd) : 0
            const salePrice = Number(sale.sale_price_usd)
            const profit = salePrice - cost
            const margin = calcMargin(salePrice, cost)

            return (
              <tr key={sale.id} className="hover:bg-gray-800/30 transition-colors">
                {/* Reloj */}
                <td className="py-3 pr-4">
                  <div>
                    <p className="text-gray-100 font-medium">
                      {watch ? `${watch.brand} ${watch.model}` : '—'}
                    </p>
                    {watch?.reference && (
                      <p className="text-gray-500 text-xs">{watch.reference}</p>
                    )}
                  </div>
                </td>

                {/* Costo */}
                <td className="py-3 px-4 text-right text-gray-400">
                  {cost > 0 ? formatCurrency(cost) : '—'}
                </td>

                {/* Precio de venta */}
                <td className="py-3 px-4 text-right text-gray-100 font-medium">
                  {formatCurrency(salePrice)}
                </td>

                {/* Ganancia */}
                <td className="py-3 px-4 text-right">
                  <span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatCurrency(profit)}
                  </span>
                  <span className="text-gray-500 text-xs ml-1">
                    ({margin.toFixed(1)}%)
                  </span>
                </td>

                {/* Plataforma */}
                <td className="py-3 pl-4">
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
                    {sale.platform}
                  </span>
                </td>

                {/* Fecha */}
                <td className="py-3 pl-4 text-gray-400 whitespace-nowrap">
                  {formatDate(sale.sale_date)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
