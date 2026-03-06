# ⌚ WatchTracker Ecuador

Aplicación de gestión de importación y reventa de relojes en Ecuador.
Compra en Jomashop/Amazon, importa con courier, vende en Facebook/Instagram.

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router)
- **Base de datos:** Supabase (PostgreSQL)
- **Estilos:** Tailwind CSS + tema oscuro de lujo
- **Deploy:** Vercel

---

## Setup — Instrucciones de instalación

### 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto (elige la región más cercana a Ecuador, e.g., us-east-1)
3. Espera que el proyecto se inicialice (~2 minutos)
4. Ve a **SQL Editor** en el panel lateral
5. Copia y pega el contenido de `supabase/schema.sql` y ejecútalo con el botón **Run**
6. Verifica en **Table Editor** que se crearon las tablas `watches` y `sales`

### 2. Obtener las credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings → API**
2. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.local.example .env.local

# Edita .env.local con tus credenciales reales
```

El archivo `.env.local` debe quedar así:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Instalar dependencias y correr en local

```bash
# Instalar Node.js 18+ si no lo tienes (recomendado: usar nvm)
# https://nodejs.org/

# Instalar dependencias
npm install

# Correr en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Deploy en Vercel

1. Sube el código a GitHub (o usa Vercel CLI)
2. Ve a [vercel.com](https://vercel.com) → **Add New Project**
3. Importa tu repositorio
4. En **Environment Variables**, agrega las dos variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Haz click en **Deploy** — Vercel detecta Next.js automáticamente

---

## Funcionalidades

### Dashboard (`/`)
- Tarjetas KPI: stock, inversión, ganancia potencial/realizada, relojes en tránsito
- Gráfico de barras: ingresos y ganancia de los últimos 6 meses
- Gráfico de dona: distribución del stock por marca
- Tabla de las últimas 5 ventas

### Inventario (`/inventario`)
- Tabla completa de todos los relojes
- Búsqueda por marca, modelo o referencia
- Filtros por estado, fuente y marca
- Ordenamiento por columnas
- Agregar nuevo reloj (modal con cálculos en tiempo real)
- Editar reloj existente
- Registrar venta (solo para relojes en stock)

### Ventas (`/ventas`)
- Historial completo de ventas
- Filtros por plataforma y mes
- Resumen: total recaudado, costo, ganancia, margen promedio

---

## Estructura del proyecto

```
watchtracker/
├── app/
│   ├── globals.css          # Estilos globales y tema oscuro
│   ├── layout.tsx           # Layout raíz con AppShell
│   ├── page.tsx             # Dashboard (Server Component)
│   ├── inventario/
│   │   └── page.tsx         # Inventario (Server Component)
│   └── ventas/
│       └── page.tsx         # Ventas (Server Component)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx     # Wrapper principal (sidebar + children)
│   │   ├── Sidebar.tsx      # Navegación desktop colapsable
│   │   └── BottomNav.tsx    # Navegación móvil (bottom bar)
│   ├── dashboard/
│   │   ├── KPICards.tsx     # Tarjetas de métricas
│   │   ├── SalesChart.tsx   # Gráfico de barras (recharts)
│   │   ├── BrandDonut.tsx   # Gráfico de dona (recharts)
│   │   └── RecentSalesTable.tsx
│   ├── inventory/
│   │   ├── WatchTable.tsx   # Tabla con filtros y acciones
│   │   ├── WatchModal.tsx   # Modal agregar/editar reloj
│   │   └── SaleModal.tsx    # Modal registrar venta
│   └── ventas/
│       └── VentasContent.tsx # Tabla de ventas con filtros
├── lib/
│   ├── types.ts             # Interfaces TypeScript
│   ├── supabase.ts          # Cliente de Supabase
│   └── utils.ts             # Funciones utilitarias
├── supabase/
│   └── schema.sql           # Schema de la base de datos
└── .env.local.example       # Plantilla de variables de entorno
```

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo en localhost:3000
npm run build    # Build de producción
npm run start    # Iniciar servidor de producción
npm run lint     # Verificar errores de ESLint
```

---

## Troubleshooting

**Error: "Variables de Supabase no configuradas"**
→ Verifica que el archivo `.env.local` existe y tiene las variables correctas. Reinicia el servidor de desarrollo después de modificarlo.

**Error 401 o "Invalid API key"**
→ Asegúrate de usar la clave `anon` (pública), no la clave `service_role` (privada).

**Las tablas no aparecen en la app**
→ Verifica que ejecutaste el schema SQL correctamente en Supabase y que las políticas RLS están activas.

**La columna `total_cost_usd` da error al insertar**
→ Es una columna GENERADA — nunca la incluyas en INSERT o UPDATE. La app ya está configurada para omitirla correctamente.
