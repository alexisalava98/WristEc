-- ============================================================
-- Schema de base de datos — WatchTracker Ecuador
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================

-- Habilitar la extensión UUID (normalmente ya está activa en Supabase)
create extension if not exists "uuid-ossp";

-- ============================================================
-- Tabla: watches (relojes)
-- ============================================================
create table public.watches (
  id                  uuid          default uuid_generate_v4() primary key,
  brand               text          not null,
  model               text          not null,
  reference           text,
  source              text          not null
                        check (source in ('Jomashop', 'Amazon', 'Otro')),
  purchase_price_usd  decimal(10,2) not null check (purchase_price_usd >= 0),
  shipping_cost_usd   decimal(10,2) not null default 0 check (shipping_cost_usd >= 0),
  import_tax_usd      decimal(10,2) not null default 0 check (import_tax_usd >= 0),

  -- Columna generada: suma automática de los 3 costos
  total_cost_usd      decimal(10,2) generated always as
                        (purchase_price_usd + shipping_cost_usd + import_tax_usd) stored,

  selling_price_usd   decimal(10,2),
  status              text          not null default 'en_transito'
                        check (status in ('en_transito', 'en_stock', 'vendido')),
  purchase_date       date          not null,
  arrival_date        date,
  notes               text,
  image_url           text,
  created_at          timestamptz   not null default now()
);

-- Comentarios en las columnas
comment on table  public.watches                   is 'Inventario de relojes importados';
comment on column public.watches.source            is 'Tienda de origen: Jomashop, Amazon u Otro';
comment on column public.watches.total_cost_usd    is 'Costo total generado automáticamente: precio + envío + impuestos';
comment on column public.watches.status            is 'Estado del reloj: en_transito, en_stock, vendido';

-- ============================================================
-- Tabla: sales (ventas)
-- ============================================================
create table public.sales (
  id              uuid          default uuid_generate_v4() primary key,
  watch_id        uuid          not null
                    references public.watches(id) on delete cascade,
  sale_price_usd  decimal(10,2) not null check (sale_price_usd > 0),
  sale_date       date          not null,
  platform        text          not null
                    check (platform in (
                      'Facebook Marketplace',
                      'Grupo Facebook',
                      'Instagram',
                      'Presencial',
                      'Otro'
                    )),
  buyer_name      text,
  notes           text,
  created_at      timestamptz   not null default now()
);

comment on table  public.sales              is 'Historial de ventas de relojes';
comment on column public.sales.platform     is 'Plataforma donde se realizó la venta';

-- ============================================================
-- Índices para mejorar el rendimiento de las consultas
-- ============================================================
create index idx_watches_status      on public.watches(status);
create index idx_watches_brand       on public.watches(brand);
create index idx_watches_source      on public.watches(source);
create index idx_watches_created_at  on public.watches(created_at desc);
create index idx_sales_watch_id      on public.sales(watch_id);
create index idx_sales_sale_date     on public.sales(sale_date desc);
create index idx_sales_platform      on public.sales(platform);

-- ============================================================
-- Row Level Security (RLS)
-- Activado pero con política pública (app de uso personal sin auth)
-- Si en el futuro agregas autenticación, actualiza estas políticas
-- ============================================================
alter table public.watches enable row level security;
alter table public.sales    enable row level security;

-- Política permisiva: permite todas las operaciones sin autenticación
create policy "Acceso público a watches"
  on public.watches
  for all
  using (true)
  with check (true);

create policy "Acceso público a sales"
  on public.sales
  for all
  using (true)
  with check (true);

-- ============================================================
-- Datos de ejemplo (opcional — comentar/eliminar si no se necesitan)
-- ============================================================

/*
-- Insertar relojes de ejemplo
insert into public.watches
  (brand, model, reference, source, purchase_price_usd, shipping_cost_usd, import_tax_usd, selling_price_usd, status, purchase_date, arrival_date, notes)
values
  ('Seiko', 'Prospex SPB143', 'SPB143J1', 'Jomashop', 280.00, 18.00, 35.00, 420.00, 'en_stock', '2024-10-15', '2024-11-02', 'Automático, reloj de buceo 200m'),
  ('Citizen', 'Promaster Aqualand', 'BJ2169-01E', 'Amazon', 195.00, 18.00, 25.00, 320.00, 'en_stock', '2024-11-01', '2024-11-20', 'Eco-Drive, profundímetro digital'),
  ('Tissot', 'PRX Powermatic 80', 'T137.407.11.051.00', 'Jomashop', 520.00, 18.00, 65.00, 800.00, 'en_transito', '2025-01-10', null, 'Pedido reciente, esperar llegada'),
  ('Casio', 'G-Shock GA-2100', 'GA-2100-1A1', 'Amazon', 65.00, 18.00, 0.00, 110.00, 'vendido', '2024-09-05', '2024-09-22', 'CasiOak negro, muy popular');
*/
