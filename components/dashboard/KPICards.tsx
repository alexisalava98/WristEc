// ============================================================
// KPICards — Tarjetas de métricas clave del Dashboard
// Server Component: recibe datos calculados como props
// ============================================================
import { TrendingUp, Package, DollarSign, Clock, ShoppingCart, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { DashboardKPIs } from '@/lib/types'

interface KPICardsProps {
  kpis: DashboardKPIs
}

export function KPICards({ kpis }: KPICardsProps) {
  // Margen potencial del stock actual
  const potentialMargin =
    kpis.stockTotalCost > 0
      ? ((kpis.stockTotalSellingPrice - kpis.stockTotalCost) / kpis.stockTotalCost) * 100
      : 0

  // Margen realizado promedio
  const realizedMargin =
    kpis.totalRevenue > 0
      ? ((kpis.realizedGain / kpis.totalRevenue) * 100)
      : 0

  const cards = [
    {
      title: 'Relojes en Stock',
      value: kpis.stockCount.toString(),
      subtitle: `${kpis.inTransitCount} en tránsito`,
      icon: Package,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Invertido en Stock',
      value: formatCurrency(kpis.stockTotalCost),
      subtitle: `Venta potencial: ${formatCurrency(kpis.stockTotalSellingPrice)}`,
      icon: DollarSign,
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/20',
    },
    {
      title: 'Ganancia Potencial',
      value: formatCurrency(kpis.stockTotalSellingPrice - kpis.stockTotalCost),
      subtitle: `Margen: ${potentialMargin.toFixed(1)}%`,
      icon: TrendingUp,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Relojes Vendidos',
      value: kpis.soldCount.toString(),
      subtitle: `${kpis.soldThisMonth} este mes`,
      icon: ShoppingCart,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Ganancia Realizada',
      value: formatCurrency(kpis.realizedGain),
      subtitle: `Margen promedio: ${realizedMargin.toFixed(1)}%`,
      icon: ArrowUpRight,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'En Tránsito',
      value: kpis.inTransitCount.toString(),
      subtitle: 'Pendientes de llegada',
      icon: Clock,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className={`
              bg-gray-900 rounded-xl p-5 border ${card.borderColor}
              card-hover
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-white truncate">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {card.subtitle}
                </p>
              </div>
              <div className={`${card.iconBg} rounded-lg p-2.5 ml-3 shrink-0`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
