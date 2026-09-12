-- MercaGo — schema propio de la app, siguiendo la convención del
-- ecosistema Folio: un schema de Postgres por app (app_mercago),
-- nunca tablas de identidad paralelas. Toda tabla con user_id referencia
-- public.users(id). Reutilizamos public.listings / listing_threads /
-- listing_messages / listing_reach / user_events tal cual existen — no se
-- toca el esquema maestro en esta migración.

-- ============================================================
-- 0. Schema + registro de plataforma
-- ============================================================
create schema if not exists app_mercago;

insert into public.platforms (platform_code, name, slug, description, platform_type, domain, subdomain, schema_name, status)
values (
  'MERCAGO',
  'MercaGo',
  'mercago',
  'Marketplace de clasificados: publica y contacta directo, sin carrito ni checkout de productos.',
  'web',
  'miacademiapreu.com',
  'mercago',
  'app_mercago',
  'live'
)
on conflict (platform_code) do nothing;

-- ============================================================
-- 1. staff — roles propios de esta app, independientes de private.is_admin()
-- ============================================================
create table if not exists app_mercago.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  role text not null check (role in ('superadmin', 'moderador', 'soporte_financiero')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function app_mercago.is_staff()
returns boolean language sql stable security definer set search_path = public, app_mercago as $$
  select exists (
    select 1 from app_mercago.staff s where s.user_id = auth.uid() and s.is_active
  );
$$;

create or replace function app_mercago.is_admin()
returns boolean language sql stable security definer set search_path = public, app_mercago as $$
  select exists (
    select 1 from app_mercago.staff s
    where s.user_id = auth.uid() and s.is_active and s.role = 'superadmin'
  );
$$;

revoke all on function app_mercago.is_staff() from public;
revoke all on function app_mercago.is_admin() from public;
grant execute on function app_mercago.is_staff() to authenticated, service_role;
grant execute on function app_mercago.is_admin() to authenticated, service_role;

alter table app_mercago.staff enable row level security;

drop policy if exists staff_select_self_or_staff on app_mercago.staff;
create policy staff_select_self_or_staff on app_mercago.staff
  for select using (user_id = auth.uid() or app_mercago.is_staff());

drop policy if exists staff_write_admin_only on app_mercago.staff;
create policy staff_write_admin_only on app_mercago.staff
  for all using (app_mercago.is_admin()) with check (app_mercago.is_admin());

-- NOTA: la primera fila de staff (superadmin) se inserta con service_role
-- (bypassa RLS) al provisionar la cuenta jrenzosamco@gmail.com — no requiere
-- edición manual de esta migración.

-- trigger genérico updated_at, reutilizado en varias tablas de abajo
create or replace function app_mercago.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists staff_set_updated_at on app_mercago.staff;
create trigger staff_set_updated_at before update on app_mercago.staff
  for each row execute function app_mercago.set_updated_at();

-- ============================================================
-- 2. settings — singleton key/value, incluye el interruptor de monetización
-- ============================================================
create table if not exists app_mercago.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id)
);

insert into app_mercago.settings (key, value)
values ('monetization', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;

alter table app_mercago.settings enable row level security;

drop policy if exists settings_select_all on app_mercago.settings;
create policy settings_select_all on app_mercago.settings for select using (true);

drop policy if exists settings_write_admin_only on app_mercago.settings;
create policy settings_write_admin_only on app_mercago.settings
  for all using (app_mercago.is_admin()) with check (app_mercago.is_admin());

-- ============================================================
-- 3. categorías + campos dinámicos por categoría
-- ============================================================
create table if not exists app_mercago.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references app_mercago.categories(id) on delete set null,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists categories_set_updated_at on app_mercago.categories;
create trigger categories_set_updated_at before update on app_mercago.categories
  for each row execute function app_mercago.set_updated_at();

create table if not exists app_mercago.category_fields (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references app_mercago.categories(id) on delete cascade,
  key text not null,
  label text not null,
  field_type text not null check (field_type in ('text', 'number', 'select', 'boolean')),
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, key)
);

create table if not exists app_mercago.listing_field_values (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  field_id uuid not null references app_mercago.category_fields(id) on delete cascade,
  value text,
  created_at timestamptz not null default now(),
  unique (listing_id, field_id)
);

-- liga un listing maestro a nuestra categoría estructurada (listings.category
-- en la maestra es solo texto libre) y, más adelante, a una suscripción.
create table if not exists app_mercago.listing_meta (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  category_id uuid references app_mercago.categories(id),
  subscription_id uuid,
  renewed_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists listing_meta_set_updated_at on app_mercago.listing_meta;
create trigger listing_meta_set_updated_at before update on app_mercago.listing_meta
  for each row execute function app_mercago.set_updated_at();

alter table app_mercago.categories enable row level security;
alter table app_mercago.category_fields enable row level security;
alter table app_mercago.listing_field_values enable row level security;
alter table app_mercago.listing_meta enable row level security;

drop policy if exists categories_select_active on app_mercago.categories;
create policy categories_select_active on app_mercago.categories
  for select using (is_active or app_mercago.is_staff());

drop policy if exists categories_write_staff on app_mercago.categories;
create policy categories_write_staff on app_mercago.categories
  for all using (app_mercago.is_staff()) with check (app_mercago.is_staff());

drop policy if exists category_fields_select_all on app_mercago.category_fields;
create policy category_fields_select_all on app_mercago.category_fields for select using (true);

drop policy if exists category_fields_write_staff on app_mercago.category_fields;
create policy category_fields_write_staff on app_mercago.category_fields
  for all using (app_mercago.is_staff()) with check (app_mercago.is_staff());

drop policy if exists listing_field_values_select on app_mercago.listing_field_values;
create policy listing_field_values_select on app_mercago.listing_field_values
  for select using (
    exists (select 1 from public.listings l where l.id = listing_id and (l.user_id = auth.uid() or (l.active and not l.hidden)))
    or app_mercago.is_staff()
  );

drop policy if exists listing_field_values_write_owner on app_mercago.listing_field_values;
create policy listing_field_values_write_owner on app_mercago.listing_field_values
  for all using (exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid()))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid()));

drop policy if exists listing_meta_select on app_mercago.listing_meta;
create policy listing_meta_select on app_mercago.listing_meta
  for select using (
    exists (select 1 from public.listings l where l.id = listing_id and (l.user_id = auth.uid() or (l.active and not l.hidden)))
    or app_mercago.is_staff()
  );

drop policy if exists listing_meta_write_owner_or_staff on app_mercago.listing_meta;
create policy listing_meta_write_owner_or_staff on app_mercago.listing_meta
  for all using (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid()) or app_mercago.is_staff()
  )
  with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid()) or app_mercago.is_staff()
  );

-- ============================================================
-- 4. favoritos — no existe nada equivalente en la maestra
-- ============================================================
create table if not exists app_mercago.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table app_mercago.favorites enable row level security;

drop policy if exists favorites_owner_all on app_mercago.favorites;
create policy favorites_owner_all on app_mercago.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- 5. reportes (cola de moderación)
-- ============================================================
create table if not exists app_mercago.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid references public.users(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table app_mercago.reports enable row level security;

drop policy if exists reports_insert_authenticated on app_mercago.reports;
create policy reports_insert_authenticated on app_mercago.reports
  for insert with check (reporter_id = auth.uid());

drop policy if exists reports_select_own_or_staff on app_mercago.reports;
create policy reports_select_own_or_staff on app_mercago.reports
  for select using (reporter_id = auth.uid() or app_mercago.is_staff());

drop policy if exists reports_update_staff on app_mercago.reports;
create policy reports_update_staff on app_mercago.reports
  for update using (app_mercago.is_staff()) with check (app_mercago.is_staff());

-- ============================================================
-- 6. planes / órdenes / suscripciones — modelo listo, SIN USARSE mientras
--    settings.monetization.enabled = false
-- ============================================================
create table if not exists app_mercago.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  price numeric(10,2) not null,
  currency text not null default 'PEN' check (currency in ('PEN', 'USD')),
  listing_slots int not null,
  duration_days int not null default 30,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into app_mercago.plans (code, name, price, listing_slots, duration_days, sort_order) values
  ('basic', 'Individual', 10.00, 1, 30, 1),
  ('plus',  'Emprendedor', 15.00, 3, 30, 2),
  ('pro',   'Negocio', 30.00, 8, 30, 3)
on conflict (code) do nothing;

create table if not exists app_mercago.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references app_mercago.plans(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  amount numeric(10,2) not null,
  currency text not null default 'PEN' check (currency in ('PEN', 'USD')),
  payment_proof_url text,
  payment_reference text,
  admin_note text,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists app_mercago.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references app_mercago.plans(id),
  order_id uuid references app_mercago.orders(id),
  slots_total int not null,
  slots_used int not null default 0,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'listing_meta_subscription_fk'
  ) then
    alter table app_mercago.listing_meta
      add constraint listing_meta_subscription_fk foreign key (subscription_id)
      references app_mercago.subscriptions(id);
  end if;
end $$;

alter table app_mercago.plans enable row level security;
alter table app_mercago.orders enable row level security;
alter table app_mercago.subscriptions enable row level security;

drop policy if exists plans_select_active on app_mercago.plans;
create policy plans_select_active on app_mercago.plans for select using (is_active or app_mercago.is_staff());

drop policy if exists plans_write_staff on app_mercago.plans;
create policy plans_write_staff on app_mercago.plans
  for all using (app_mercago.is_staff()) with check (app_mercago.is_staff());

drop policy if exists orders_select_own_or_staff on app_mercago.orders;
create policy orders_select_own_or_staff on app_mercago.orders
  for select using (user_id = auth.uid() or app_mercago.is_staff());

drop policy if exists orders_insert_own on app_mercago.orders;
create policy orders_insert_own on app_mercago.orders
  for insert with check (user_id = auth.uid());

drop policy if exists orders_update_staff on app_mercago.orders;
create policy orders_update_staff on app_mercago.orders
  for update using (app_mercago.is_staff()) with check (app_mercago.is_staff());

drop policy if exists subscriptions_select_own_or_staff on app_mercago.subscriptions;
create policy subscriptions_select_own_or_staff on app_mercago.subscriptions
  for select using (user_id = auth.uid() or app_mercago.is_staff());

drop policy if exists subscriptions_write_staff on app_mercago.subscriptions;
create policy subscriptions_write_staff on app_mercago.subscriptions
  for all using (app_mercago.is_staff()) with check (app_mercago.is_staff());

-- ============================================================
-- 7. bitácora propia (staff-only)
-- ============================================================
create table if not exists app_mercago.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id),
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table app_mercago.audit_log enable row level security;

drop policy if exists audit_log_select_staff on app_mercago.audit_log;
create policy audit_log_select_staff on app_mercago.audit_log for select using (app_mercago.is_staff());

drop policy if exists audit_log_insert_staff on app_mercago.audit_log;
create policy audit_log_insert_staff on app_mercago.audit_log for insert with check (app_mercago.is_staff());

-- ============================================================
-- 8. índices
-- ============================================================
create index if not exists idx_category_fields_category on app_mercago.category_fields (category_id);
create index if not exists idx_listing_field_values_listing on app_mercago.listing_field_values (listing_id);
create index if not exists idx_listing_meta_category on app_mercago.listing_meta (category_id);
create index if not exists idx_favorites_user on app_mercago.favorites (user_id);
create index if not exists idx_reports_status on app_mercago.reports (status, created_at desc);
create index if not exists idx_orders_status on app_mercago.orders (status, created_at desc);
create index if not exists idx_subscriptions_user on app_mercago.subscriptions (user_id, status);
create index if not exists idx_audit_log_created on app_mercago.audit_log (created_at desc);

-- ============================================================
-- 9. seed de categorías iniciales (editable después desde el admin)
-- ============================================================
insert into app_mercago.categories (slug, name, icon, sort_order) values
  ('vehiculos', 'Vehículos', 'car', 1),
  ('tecnologia', 'Tecnología', 'cpu', 2),
  ('celulares', 'Celulares', 'phone', 3),
  ('computadoras', 'Computadoras', 'laptop', 4),
  ('hogar', 'Hogar', 'home', 5),
  ('muebles', 'Muebles', 'sofa', 6),
  ('electrodomesticos', 'Electrodomésticos', 'plug', 7),
  ('moda', 'Moda', 'shirt', 8),
  ('deportes', 'Deportes', 'dumbbell', 9),
  ('herramientas', 'Herramientas', 'wrench', 10),
  ('inmuebles', 'Inmuebles', 'building', 11),
  ('servicios', 'Servicios', 'briefcase', 12),
  ('empleo', 'Empleo', 'user-check', 13),
  ('mascotas', 'Mascotas', 'paw', 14),
  ('otros', 'Otros', 'box', 15)
on conflict (slug) do nothing;
