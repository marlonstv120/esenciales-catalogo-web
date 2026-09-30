create sequence public.solicitudes_codigo_seq;

create table public.solicitudes (
  id integer generated always as identity primary key,
  codigo text not null unique,
  identificador_intento uuid not null unique,
  nombre_cliente text not null,
  telefono text not null,
  ciudad text,
  observaciones text,
  terminos_version text not null,
  politica_datos_version text not null,
  aceptado_en timestamptz not null,
  estado text not null default 'nueva',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  confirmado_en timestamptz,
  entregado_en timestamptz,
  cancelado_en timestamptz,
  constraint solicitudes_codigo_valido check (
    codigo = btrim(codigo) and codigo ~ '^ES-[0-9]+$'
  ),
  constraint solicitudes_nombre_cliente_valido check (
    nombre_cliente = btrim(nombre_cliente) and nombre_cliente <> ''
  ),
  constraint solicitudes_telefono_valido check (
    telefono = btrim(telefono) and telefono <> ''
  ),
  constraint solicitudes_ciudad_valida check (
    ciudad is null or (ciudad = btrim(ciudad) and ciudad <> '')
  ),
  constraint solicitudes_observaciones_validas check (
    observaciones is null or (observaciones = btrim(observaciones) and observaciones <> '')
  ),
  constraint solicitudes_terminos_version_valida check (
    terminos_version = btrim(terminos_version) and terminos_version <> ''
  ),
  constraint solicitudes_politica_datos_version_valida check (
    politica_datos_version = btrim(politica_datos_version) and politica_datos_version <> ''
  ),
  constraint solicitudes_estado_valido check (
    estado in ('nueva', 'confirmada', 'entregada', 'cancelada')
  )
);

create trigger solicitudes_actualizar_fecha
before update on public.solicitudes
for each row execute function public.actualizar_actualizado_en();

create index solicitudes_estado_creado_en_idx on public.solicitudes (estado, creado_en desc);

create table public.detalles_solicitud (
  id integer generated always as identity primary key,
  solicitud_id integer not null references public.solicitudes (id) on update cascade on delete restrict,
  presentacion_id integer not null references public.presentaciones (id) on update cascade on delete restrict,
  cantidad integer not null,
  precio_unitario integer not null,
  subtotal integer generated always as (cantidad * precio_unitario) stored,
  cantidad_descontada integer not null default 0,
  constraint detalles_solicitud_cantidad_valida check (cantidad between 1 and 99),
  constraint detalles_solicitud_precio_unitario_valido check (precio_unitario > 0),
  constraint detalles_solicitud_cantidad_descontada_valida check (
    cantidad_descontada between 0 and cantidad
  ),
  constraint detalles_solicitud_presentacion_unica unique (solicitud_id, presentacion_id)
);

create index detalles_solicitud_solicitud_id_idx on public.detalles_solicitud (solicitud_id);
create index detalles_solicitud_presentacion_id_idx on public.detalles_solicitud (presentacion_id);

alter table public.solicitudes enable row level security;
alter table public.detalles_solicitud enable row level security;

revoke all on table public.solicitudes from anon, authenticated;
revoke all on table public.detalles_solicitud from anon, authenticated;
revoke all on sequence public.solicitudes_codigo_seq from anon, authenticated;
revoke all on sequence public.solicitudes_id_seq from anon, authenticated;
revoke all on sequence public.detalles_solicitud_id_seq from anon, authenticated;

grant select on public.solicitudes to authenticated;
grant select on public.detalles_solicitud to authenticated;

create policy administrador_activo_consulta_solicitudes
on public.solicitudes
for select to authenticated
using ((select public.es_administrador_activo()));

create policy administrador_activo_consulta_detalles_solicitud
on public.detalles_solicitud
for select to authenticated
using ((select public.es_administrador_activo()));
