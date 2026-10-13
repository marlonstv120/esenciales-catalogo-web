-- Galería de entregas: fotos y videos de vehículos ya vendidos/entregados.
-- Se vincula con la solicitud marcada como 'entregada'.

create function public.validar_entrega_solicitud_entregada()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.solicitudes
    where id = new.solicitud_id
      and estado = 'entregada'
  ) then
    raise exception 'La solicitud debe estar marcada como entregada para registrar una entrega.';
  end if;
  return new;
end;
$$;

revoke all on function public.validar_entrega_solicitud_entregada() from public, anon, authenticated;

create table public.entregas (
  id integer generated always as identity primary key,
  solicitud_id integer not null references public.solicitudes (id) on update cascade on delete cascade,
  titulo text not null,
  descripcion text,
  publicado boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint entregas_titulo_valido check (
    titulo = btrim(titulo) and titulo <> ''
  ),
  constraint entregas_descripcion_valida check (
    descripcion is null or (descripcion = btrim(descripcion) and descripcion <> '')
  ),
  constraint entregas_solicitud_unica unique (solicitud_id)
);

create trigger entregas_actualizar_fecha
before update on public.entregas
for each row execute function public.actualizar_actualizado_en();

create trigger entregas_validar_solicitud
before insert or update of solicitud_id on public.entregas
for each row execute function public.validar_entrega_solicitud_entregada();

create index entregas_publicado_creado_en_idx on public.entregas (publicado, creado_en desc);

create table public.archivos_entrega (
  id integer generated always as identity primary key,
  entrega_id integer not null references public.entregas (id) on update cascade on delete cascade,
  url text not null,
  identificador_externo text not null,
  tipo text not null,
  texto_alternativo text,
  posicion integer not null default 0,
  creado_en timestamptz not null default now(),
  constraint archivos_entrega_tipo_valido check (tipo in ('imagen', 'video')),
  constraint archivos_entrega_posicion_valida check (posicion >= 0),
  constraint archivos_entrega_url_valida check (
    url = btrim(url) and url <> ''
  ),
  constraint archivos_entrega_identificador_valido check (
    identificador_externo = btrim(identificador_externo) and identificador_externo <> ''
  ),
  constraint archivos_entrega_texto_alternativo_valido check (
    texto_alternativo is null or (texto_alternativo = btrim(texto_alternativo) and texto_alternativo <> '')
  ),
  constraint archivos_entrega_entrega_posicion_unica unique (entrega_id, posicion)
);

create index archivos_entrega_entrega_id_idx on public.archivos_entrega (entrega_id);

alter table public.entregas enable row level security;
alter table public.archivos_entrega enable row level security;

revoke all on table public.entregas from anon, authenticated;
revoke all on table public.archivos_entrega from anon, authenticated;
revoke all on sequence public.entregas_id_seq from anon, authenticated;
revoke all on sequence public.archivos_entrega_id_seq from anon, authenticated;

-- Lectura pública de entregas publicadas (galería del sitio).
grant select on public.entregas to anon, authenticated;
grant select on public.archivos_entrega to anon, authenticated;

create policy lectura_publica_entregas
on public.entregas
for select
to anon, authenticated
using (publicado);

create policy lectura_publica_archivos_entrega
on public.archivos_entrega
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.entregas
    where entregas.id = archivos_entrega.entrega_id
      and entregas.publicado
  )
);

-- Gestión exclusiva del administrador.
grant insert, update, delete on public.entregas to authenticated;
grant usage, select on sequence public.entregas_id_seq to authenticated;
grant insert, update, delete on public.archivos_entrega to authenticated;
grant usage, select on sequence public.archivos_entrega_id_seq to authenticated;

create policy administrador_activo_gestiona_entregas
on public.entregas
for all to authenticated
using ((select public.es_administrador_activo()))
with check ((select public.es_administrador_activo()));

create policy administrador_activo_gestiona_archivos_entrega
on public.archivos_entrega
for all to authenticated
using ((select public.es_administrador_activo()))
with check ((select public.es_administrador_activo()));

-- Bucket público para las fotos y videos de las entregas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entregas',
  'entregas',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
);

create policy lectura_publica_archivos_entrega_storage
on storage.objects
for select
to public
using (bucket_id = 'entregas');

create policy administrador_activo_gestiona_archivos_entrega_storage
on storage.objects
for all
to authenticated
using (
  bucket_id = 'entregas'
  and (select public.es_administrador_activo())
)
with check (
  bucket_id = 'entregas'
  and (select public.es_administrador_activo())
);

-- RPC pública que devuelve las entregas publicadas con sus archivos y el vehículo.
create function public.obtener_entregas_publicas()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', entrega.id,
        'titulo', entrega.titulo,
        'descripcion', entrega.descripcion,
        'creado_en', entrega.creado_en,
        'solicitud_codigo', entrega.codigo,
        'vehiculo', (
          select productos.nombre
          from public.detalles_solicitud
          join public.presentaciones on presentaciones.id = detalles_solicitud.presentacion_id
          join public.productos on productos.id = presentaciones.producto_id
          where detalles_solicitud.solicitud_id = entrega.solicitud_id
          order by detalles_solicitud.id
          limit 1
        ),
        'archivos', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', archivo.id,
                'url', archivo.url,
                'tipo', archivo.tipo,
                'texto_alternativo', archivo.texto_alternativo
              )
              order by archivo.posicion, archivo.id
            )
            from public.archivos_entrega as archivo
            where archivo.entrega_id = entrega.id
          ),
          '[]'::jsonb
        )
      )
      order by entrega.creado_en desc, entrega.id desc
    ),
    '[]'::jsonb
  )
  from (
    select
      entregas.id,
      entregas.solicitud_id,
      entregas.titulo,
      entregas.descripcion,
      entregas.creado_en,
      solicitudes.codigo
    from public.entregas
    join public.solicitudes on solicitudes.id = entregas.solicitud_id
    where entregas.publicado
  ) as entrega;
$$;

revoke all on function public.obtener_entregas_publicas() from public, anon, authenticated;
grant execute on function public.obtener_entregas_publicas() to anon, authenticated;
