'use client'

// ============================================================
// BrandDonut — Gráfico de dona: distribución de stock por marca
// Client Component: recharts requiere el DOM del cliente
// ============================================================
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { BrandData } from '@/lib/types'

interface BrandDonutProps {
  data: BrandData[]
}

// Paleta de colores para las marcas (hasta 10)
const COLORS = [
  '#3b82f6', // azul
  '#f59e0b', // dorado
  '#10b981', // verde
  '#8b5cf6', // púrpura
  '#ef4444', // rojo
  '#06b6d4', // cyan
  '#f97316', // naranja
  '#84cc16', // lima
  '#ec4899', // rosa
  '#6b7280', // gris
]

// Label personalizado dentro del gráfico
function CustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.08) return null // No mostrar label si el slice es muy pequeño

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function BrandDonut({ data }: BrandDonutProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        No hay relojes en stock
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="brand"
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          labelLine={false}
          label={CustomLabel}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: 13,
          }}
          formatter={(value: number, name: string) => [`${value} reloj(es)`, name]}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ color: '#9ca3af', fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
