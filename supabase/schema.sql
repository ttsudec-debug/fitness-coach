-- Fitness Coach — seguridad y restricciones de Supabase
-- ---------------------------------------------------------------------------
-- La `anon key` está embebida en el cliente (es pública por diseño en Supabase).
-- Por eso la ÚNICA cosa que impide que un usuario lea o modifique los datos de
-- otro es Row Level Security (RLS). Este script:
--   1. Habilita RLS en las 6 tablas y crea políticas "solo mis filas".
--   2. Crea los índices únicos que necesita el upsert de la app (onConflict).
--
-- Aplicalo una vez en: Supabase → SQL Editor → New query → pegar → Run.
-- Es idempotente: se puede correr varias veces sin romper nada.
-- Requisito: cada tabla debe tener una columna `user_id uuid` (por defecto
-- referenciando auth.users). Si te falta, primero corré el bloque de más abajo.
-- ---------------------------------------------------------------------------

-- (Opcional) Asegurar la columna user_id con default = usuario autenticado.
-- Descomentá si alguna tabla no la tiene todavía.
-- alter table public.routines     add column if not exists user_id uuid default auth.uid();
-- alter table public.workouts     add column if not exists user_id uuid default auth.uid();
-- alter table public.body_logs    add column if not exists user_id uuid default auth.uid();
-- alter table public.settings     add column if not exists user_id uuid default auth.uid();
-- alter table public.meals        add column if not exists user_id uuid default auth.uid();
-- alter table public.custom_foods add column if not exists user_id uuid default auth.uid();

-- 1) RLS + políticas -----------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['routines','workouts','body_logs','settings','meals','custom_foods']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "own rows" on public.%I;', t);
    execute format(
      'create policy "own rows" on public.%I for all
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- 2) Índices únicos para el upsert (deben coincidir con onConflict del cliente)
create unique index if not exists routines_user_local     on public.routines     (user_id, local_id);
create unique index if not exists workouts_user_local     on public.workouts     (user_id, local_id);
create unique index if not exists body_logs_user_date     on public.body_logs    (user_id, date);
create unique index if not exists settings_user_key       on public.settings     (user_id, key);
create unique index if not exists custom_foods_user_name  on public.custom_foods (user_id, name);
create unique index if not exists meals_user_dmn          on public.meals        (user_id, date, meal, name);
