// ============================================================
// Funciones utilitarias — WatchTracker Ecuador
// ============================================================
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MonthlySaleData, BrandData, Sale, Watch } from './types'

/** Combina clases de Tailwind con soporte para condicionales */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea un número como moneda USD */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Formatea una fecha YYYY-MM-DD a formato legible en español */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Calcula el margen de ganancia en porcentaje */
export function calcMargin(sellingPrice: number, totalCost: number): number {
  if (totalCost <= 0) return 0
  return ((sellingPrice - totalCost) / totalCost) * 100
}

/** Devuelve la clase de color del badge según el status del reloj */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'en_transito':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'en_stock':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'vendido':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

/** Devuelve el label legible del status */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'en_transito': return 'En Tránsito'
    case 'en_stock': return 'En Stock'
    case 'vendido': return 'Vendido'
    default: return status
  }
}

/**
 * Calcula los datos de ventas de los últimos 6 meses
 * para el gráfico de barras del Dashboard
 */
export function getLast6MonthsData(sales: Sale[]): MonthlySaleData[] {
  const months: MonthlySaleData[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthSales = sales.filter((s) => {
      const sDate = new Date(s.sale_date + 'T00:00:00')
      return (
        sDate.getMonth() === date.getMonth() &&
        sDate.getFullYear() === date.getFullYear()
      )
    })

    const ingresos = monthSales.reduce((acc, s) => acc + Number(s.sale_price_usd), 0)
    const ganancia = monthSales.reduce((acc, s) => {
      const cost = s.watches?.total_cost_usd ? Number(s.watches.total_cost_usd) : 0
      return acc + (Number(s.sale_price_usd) - cost)
    }, 0)

    months.push({
      month: date.toLocaleDateString('es-EC', { month: 'short' }),
      cantidad: monthSales.length,
      ingresos,
      ganancia,
    })
  }

  return months
}

/**
 * Calcula la distribución de relojes en stock por marca
 * para el gráfico de dona del Dashboard
 */
export function getBrandDistribution(stockWatches: Watch[]): BrandData[] {
  const brandCount: Record<string, number> = {}
  stockWatches.forEach((w) => {
    brandCount[w.brand] = (brandCount[w.brand] || 0) + 1
  })
  return Object.entries(brandCount)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
}
