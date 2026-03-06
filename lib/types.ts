// ============================================================
// Tipos TypeScript para WatchTracker Ecuador
// ============================================================

/** Estado del reloj en el flujo de importación */
export type WatchStatus = 'en_transito' | 'en_stock' | 'vendido'

/** Tiendas de origen de compra */
export type WatchSource = 'Jomashop' | 'Amazon' | 'Otro'

/** Plataformas de venta */
export type SalePlatform =
  | 'Facebook Marketplace'
  | 'Grupo Facebook'
  | 'Instagram'
  | 'Presencial'
  | 'Otro'

/** Reloj completo tal como viene de Supabase */
export interface Watch {
  id: string
  brand: string
  model: string
  reference: string | null
  source: WatchSource
  purchase_price_usd: number
  shipping_cost_usd: number
  import_tax_usd: number
  total_cost_usd: number  // columna generada en Supabase
  selling_price_usd: number | null
  status: WatchStatus
  purchase_date: string   // formato YYYY-MM-DD
  arrival_date: string | null
  notes: string | null
  image_url: string | null
  created_at: string
}

/** Datos para insertar un reloj nuevo (sin campos autogenerados) */
export interface WatchInsert {
  brand: string
  model: string
  reference?: string | null
  source: WatchSource
  purchase_price_usd: number
  shipping_cost_usd: number
  import_tax_usd: number
  selling_price_usd?: number | null
  status: WatchStatus
  purchase_date: string
  arrival_date?: string | null
  notes?: string | null
  image_url?: string | null
}

/** Venta completa tal como viene de Supabase (con join a watches) */
export interface Sale {
  id: string
  watch_id: string
  sale_price_usd: number
  sale_date: string       // formato YYYY-MM-DD
  platform: SalePlatform
  buyer_name: string | null
  notes: string | null
  created_at: string
  watches?: Watch         // relación join
}

/** Datos para insertar una venta nueva */
export interface SaleInsert {
  watch_id: string
  sale_price_usd: number
  sale_date: string
  platform: SalePlatform
  buyer_name?: string | null
  notes?: string | null
}

/** KPIs calculados para el Dashboard */
export interface DashboardKPIs {
  stockCount: number
  stockTotalCost: number
  stockTotalSellingPrice: number
  inTransitCount: number
  soldCount: number
  soldThisMonth: number
  realizedGain: number
  totalRevenue: number
}

/** Dato para el gráfico de ventas por mes */
export interface MonthlySaleData {
  month: string     // ej: "Ene", "Feb"
  cantidad: number
  ingresos: number
  ganancia: number
}

/** Dato para el gráfico de dona por marca */
export interface BrandData {
  brand: string
  count: number
}
