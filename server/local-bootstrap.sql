-- Compatibilidad local para VEHIMARCAS.
--
-- Supabase provee en la nube los roles (anon / authenticated), los esquemas
-- `auth`, `storage` y `extensions`, y funciones como auth.uid(). Este archivo
-- crea equivalentes mínimos en el PostgreSQL local para poder aplicar las
-- migraciones de supabase/migrations sin modificarlas.

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Esquema auth (usuarios de la aplicación y auth.uid())
-- ---------------------------------------------------------------------------
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(coalesce(current_setting('request.jwt.claim.sub', true), ''), '')::uuid
$$;

-- ---------------------------------------------------------------------------
-- Esquema storage (buckets y objetos de la galería / comprobantes)
-- ---------------------------------------------------------------------------
create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[],
  created_at timestamptz not null default now()
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id) on delete cascade,
  name text,
  owner uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table storage.objects enable row level security;

-- ---------------------------------------------------------------------------
-- Esquema extensions (gen_random_uuid y compañía)
-- ---------------------------------------------------------------------------
create schema if not exists extensions;

create or replace function extensions.gen_random_uuid()
returns uuid
language sql
as $$
  select gen_random_uuid()
$$;
