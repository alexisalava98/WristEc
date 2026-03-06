// ============================================================
// Cliente de Supabase — WatchTracker Ecuador
// Se usa tanto en Server Components como en Client Components
// ============================================================
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Advertencia en tiempo de build si las variables no están configuradas
  console.warn(
    '⚠️  Variables de Supabase no configuradas. ' +
    'Crea un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Usar placeholders para evitar que el SDK lance un error al importarse sin env vars.
// Las llamadas reales fallarán en runtime si las vars no están configuradas, y eso
// está manejado con try/catch en cada página.
// cache: 'no-store' en cada fetch evita que Next.js cachee las respuestas de Supabase.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  }
)
