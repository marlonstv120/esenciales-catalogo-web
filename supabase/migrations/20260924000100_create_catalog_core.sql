create function public.actualizar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create table public.usuarios_administrativos (
  id uuid primary key references auth.users (id) on update cascade on delete restrict,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create trigger usuarios_administrativos_actualizar_fecha
before update on public.usuarios_administrativos
for each row execute function public.actualizar_actualizado_en();

create table public.categorias (
  id integer generated always as identity primary key,
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint categorias_nombre_valido check (
    nombre = btrim(nombre) and nombre <> ''
  )
);

create unique index categorias_nombre_unico_ci
on public.categorias (lower(nombre));

create trigger categorias_actualizar_fecha
before update on public.categorias
for each row execute function public.actualizar_actualizado_en();

create table public.productos (
  id integer generated always as identity primary key,
  categoria_id integer not null references public.categorias (id) on update cascade on delete restrict,
  nombre text not null,
  descripcion text not null,
  marca text,
  genero text,
  familia_olfativa text,
  referencia text,
  clasificacion text,
  destacado boolean not null default false,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint productos_nombre_valido check (nombre = btrim(nombre) and nombre <> ''),
  constraint productos_descripcion_valida check (descripcion = btrim(descripcion) and descripcion <> ''),
  constraint productos_marca_valida check (marca is null or (marca = btrim(marca) and marca <> '')),
  constraint productos_genero_valido check (genero is null or genero in ('hombre', 'mujer', 'unisex')),
  constraint productos_familia_olfativa_valida check (
    familia_olfativa is null or (familia_olfativa = btrim(familia_olfativa) and familia_olfativa <> '')
  ),
  constraint productos_referencia_valida check (
    referencia is null or (referencia = btrim(referencia) and referencia <> '')
  ),
  constraint productos_clasificacion_valida check (
    clasificacion is null or clasificacion in ('original', 'uno_a_uno', 'inspiracion')
  )
);

create index productos_categoria_id_idx on public.productos (categoria_id);
create unique index productos_referencia_unica
on public.productos (referencia)
where referencia is not null;

create trigger productos_actualizar_fecha
before update on public.productos
for each row execute function public.actualizar_actualizado_en();

create table public.presentaciones (
  id integer generated always as identity primary key,
  producto_id integer not null references public.productos (id) on update cascade on delete restrict,
  etiqueta text not null,
  precio_normal integer not null,
  precio_promocional integer,
  stock integer not null default 0,
  modo_disponibilidad text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint presentaciones_etiqueta_valida check (etiqueta = btrim(etiqueta) and etiqueta <> ''),
  constraint presentaciones_precio_normal_valido check (precio_normal > 0),
  constraint presentaciones_precio_promocional_valido check (
    precio_promocional is null or (precio_promocional > 0 and precio_promocional < precio_normal)
  ),
  constraint presentaciones_stock_valido check (stock >= 0),
  constraint presentaciones_modo_valido check (
    modo_disponibilidad in ('venta_inmediata', 'bajo_pedido', 'no_disponible')
  ),
  constraint presentaciones_bajo_pedido_sin_stock check (
    modo_disponibilidad <> 'bajo_pedido' or stock = 0
  )
);

create index presentaciones_producto_id_idx on public.presentaciones (producto_id);

create trigger presentaciones_actualizar_fecha
before update on public.presentaciones
for each row execute function public.actualizar_actualizado_en();

create table public.imagenes_producto (
  id integer generated always as identity primary key,
  producto_id integer not null references public.productos (id) on update cascade on delete restrict,
  url text not null,
  identificador_externo text not null,
  texto_alternativo text,
  posicion integer not null,
  creado_en timestamptz not null default now(),
  constraint imagenes_producto_url_valida check (url = btrim(url) and url <> ''),
  constraint imagenes_producto_identificador_valido check (
    identificador_externo = btrim(identificador_externo) and identificador_externo <> ''
  ),
  constraint imagenes_producto_texto_alternativo_valido check (
    texto_alternativo is null or (texto_alternativo = btrim(texto_alternativo) and texto_alternativo <> '')
  ),
  constraint imagenes_producto_posicion_valida check (posicion >= 0),
  constraint imagenes_producto_posicion_unica unique (producto_id, posicion)
);

create index imagenes_producto_producto_id_idx on public.imagenes_producto (producto_id);

alter table public.usuarios_administrativos enable row level security;
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.presentaciones enable row level security;
alter table public.imagenes_producto enable row level security;

revoke all on table public.usuarios_administrativos from anon, authenticated;
revoke all on table public.categorias from anon, authenticated;
revoke all on table public.productos from anon, authenticated;
revoke all on table public.presentaciones from anon, authenticated;
revoke all on table public.imagenes_producto from anon, authenticated;

revoke all on sequence public.categorias_id_seq from anon, authenticated;
revoke all on sequence public.productos_id_seq from anon, authenticated;
revoke all on sequence public.presentaciones_id_seq from anon, authenticated;
revoke all on sequence public.imagenes_producto_id_seq from anon, authenticated;

revoke all on function public.actualizar_actualizado_en() from public, anon, authenticated;
