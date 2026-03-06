'use client'

// ============================================================
// SalesChart — Gráfico de barras de ventas por mes
// Client Component: recharts requiere el DOM del cliente
// ============================================================
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlySaleData } from '@/lib/types'

interface SalesChartProps {
  data: MonthlySaleData[]
}

// Tooltip personalizado con tema oscuro
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-gray-300 font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="text-white font-medium">
            ${entry.value.toLocaleString('es-EC', { minimumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  )
}

export function SalesChart({ data }: SalesChartProps) {
  // Si no hay datos, mostrar estado vacío
  const hasData = data.some((d) => d.ingresos > 0 || d.ganancia > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        No hay ventas registradas aún
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        barGap={4}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Legend
          wrapperStyle={{ color: '#9ca3af', fontSize: 12, paddingTop: 12 }}
        />
        <Bar
          dataKey="ingresos"
          name="Ingresos"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="ganancia"
          name="Ganancia"
          fill="#f59e0b"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
