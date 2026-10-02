alter table public.solicitudes
add column token_cliente uuid not null default extensions.gen_random_uuid();

alter table public.solicitudes
add constraint solicitudes_token_cliente_unico unique (token_cliente);

create table public.pagos_solicitud (
  id integer generated always as identity primary key,
  solicitud_id integer not null unique references public.solicitudes (id) on update cascade on delete restrict,
  metodo text not null default 'bre_b',
  estado text not null default 'pendiente',
  monto integer not null,
  comprobante_path text,
  comprobante_mime text,
  comprobante_bytes integer,
  comprobante_nombre_original text,
  enviado_en timestamptz,
  revisado_en timestamptz,
  revisado_por uuid references auth.users (id) on update cascade on delete restrict,
  observacion_revision text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint pagos_solicitud_metodo_valido check (metodo = 'bre_b'),
  constraint pagos_solicitud_estado_valido check (estado in ('pendiente', 'comprobante_enviado', 'verificado', 'rechazado')),
  constraint pagos_solicitud_monto_valido check (monto > 0),
  constraint pagos_solicitud_comprobante_consistente check (
    (estado = 'comprobante_enviado' and comprobante_path is not null and comprobante_mime is not null and comprobante_bytes is not null and enviado_en is not null)
    or (estado <> 'comprobante_enviado')
  ),
  constraint pagos_solicitud_archivo_valido check (
    comprobante_path is null
    or (
      comprobante_path ~ '^solicitudes/[0-9]+/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|pdf)$'
      and comprobante_mime in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
      and comprobante_bytes between 1 and 5242880
    )
  ),
  constraint pagos_solicitud_observacion_valida check (
    observacion_revision is null
    or (observacion_revision = btrim(observacion_revision) and char_length(observacion_revision) between 1 and 500)
  ),
  constraint pagos_solicitud_rechazo_con_observacion check (
    estado <> 'rechazado' or observacion_revision is not null
  )
);

create trigger pagos_solicitud_actualizar_fecha
before update on public.pagos_solicitud
for each row execute function public.actualizar_actualizado_en();

create index pagos_solicitud_estado_idx on public.pagos_solicitud (estado);

-- Existing requests predate this feature and retain a pending payment record.
insert into public.pagos_solicitud (solicitud_id, monto)
select s.id, sum(d.subtotal)::integer
from public.solicitudes s
join public.detalles_solicitud d on d.solicitud_id = s.id
group by s.id;

alter table public.pagos_solicitud enable row level security;
revoke all on table public.pagos_solicitud from anon, authenticated;
revoke all on sequence public.pagos_solicitud_id_seq from anon, authenticated;
grant select on public.pagos_solicitud to authenticated;

create policy administrador_activo_consulta_pagos_solicitud
on public.pagos_solicitud
for select to authenticated
using ((select public.es_administrador_activo()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprobantes-pago',
  'comprobantes-pago',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

create policy administrador_activo_gestiona_comprobantes_pago
on storage.objects
for all to authenticated
using (
  bucket_id = 'comprobantes-pago'
  and (select public.es_administrador_activo())
)
with check (
  bucket_id = 'comprobantes-pago'
  and (select public.es_administrador_activo())
);

create or replace function public.respuesta_registro_solicitud(solicitud_id integer)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'codigo', s.codigo,
    'token_cliente', s.token_cliente,
    'estado', s.estado,
    'valor_total_productos', coalesce(sum(d.subtotal), 0),
    'lineas', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'presentacion_id', d.presentacion_id,
          'producto', p.nombre,
          'presentacion', pr.etiqueta,
          'cantidad', d.cantidad,
          'precio_unitario', d.precio_unitario,
          'subtotal', d.subtotal
        ) order by d.id
      ),
      '[]'::jsonb
    )
  )
  from public.solicitudes s
  join public.detalles_solicitud d on d.solicitud_id = s.id
  join public.presentaciones pr on pr.id = d.presentacion_id
  join public.productos p on p.id = pr.producto_id
  where s.id = $1
  group by s.id, s.codigo, s.token_cliente, s.estado;
$$;

create or replace function public.registrar_solicitud_compra(
  p_identificador_intento uuid, p_nombre_cliente text, p_telefono text, p_ciudad text,
  p_observaciones text, p_lineas jsonb, p_acepta_terminos boolean, p_acepta_politica_datos boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre_cliente text := btrim(coalesce(p_nombre_cliente, ''));
  v_telefono text := btrim(coalesce(p_telefono, ''));
  v_ciudad text := nullif(btrim(coalesce(p_ciudad, '')), '');
  v_observaciones text := nullif(btrim(coalesce(p_observaciones, '')), '');
  v_digitos_telefono text;
  v_lineas_normalizadas jsonb;
  v_lineas_existentes jsonb;
  v_resumen_cambio_precio jsonb;
  v_cantidad_lineas integer;
  v_solicitud public.solicitudes%rowtype;
  v_solicitud_id integer;
  v_detalles_insertados integer;
  v_terminos_version text;
  v_politica_datos_version text;
begin
  if p_identificador_intento is null then raise exception 'El identificador de intento es obligatorio' using errcode = '22023'; end if;
  if char_length(v_nombre_cliente) not between 2 and 100 then raise exception 'El nombre debe tener entre 2 y 100 caracteres' using errcode = '22023'; end if;
  if v_telefono !~ '^[0-9+() -]+$' then raise exception 'El telefono contiene caracteres no permitidos' using errcode = '22023'; end if;
  v_digitos_telefono := regexp_replace(v_telefono, '[^0-9]', '', 'g');
  if char_length(v_digitos_telefono) not between 7 and 15 then raise exception 'El telefono debe contener entre 7 y 15 digitos' using errcode = '22023'; end if;
  if v_ciudad is not null and char_length(v_ciudad) > 100 then raise exception 'La ciudad no puede superar 100 caracteres' using errcode = '22023'; end if;
  if v_observaciones is not null and char_length(v_observaciones) > 500 then raise exception 'Las observaciones no pueden superar 500 caracteres' using errcode = '22023'; end if;
  if p_acepta_terminos is not true or p_acepta_politica_datos is not true then raise exception 'Debes aceptar los terminos y la politica de datos' using errcode = '22023'; end if;
  if p_lineas is null or jsonb_typeof(p_lineas) <> 'array' or jsonb_array_length(p_lineas) = 0 then raise exception 'La solicitud debe tener al menos una linea' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_lineas) linea where jsonb_typeof(linea) <> 'object' or coalesce(linea->>'presentacion_id', '') !~ '^[1-9][0-9]*$' or char_length(coalesce(linea->>'presentacion_id', '')) > 10 or coalesce(linea->>'cantidad', '') !~ '^[1-9][0-9]?$' or coalesce(linea->>'precio_esperado', '') !~ '^[1-9][0-9]*$' or char_length(coalesce(linea->>'precio_esperado', '')) > 10) then raise exception 'Las lineas de solicitud no son validas' using errcode = '22023'; end if;
  select count(*) into v_cantidad_lineas from jsonb_array_elements(p_lineas);
  if v_cantidad_lineas > 50 then raise exception 'La solicitud no puede superar 50 lineas' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_lineas) linea group by (linea->>'presentacion_id')::integer having count(*) > 1) then raise exception 'No se puede repetir una presentacion en la solicitud' using errcode = '22023'; end if;
  select jsonb_agg(jsonb_build_object('presentacion_id', (linea->>'presentacion_id')::integer, 'cantidad', (linea->>'cantidad')::integer) order by (linea->>'presentacion_id')::integer) into v_lineas_normalizadas from jsonb_array_elements(p_lineas) linea;
  select * into v_solicitud from public.solicitudes s where s.identificador_intento = p_identificador_intento;
  if found then
    select jsonb_agg(jsonb_build_object('presentacion_id', d.presentacion_id, 'cantidad', d.cantidad) order by d.presentacion_id) into v_lineas_existentes from public.detalles_solicitud d where d.solicitud_id = v_solicitud.id;
    if v_solicitud.nombre_cliente = v_nombre_cliente and v_solicitud.telefono = v_telefono and v_solicitud.ciudad is not distinct from v_ciudad and v_solicitud.observaciones is not distinct from v_observaciones and v_lineas_existentes = v_lineas_normalizadas then return public.respuesta_registro_solicitud(v_solicitud.id); end if;
    raise exception 'El identificador de intento ya fue usado con contenido diferente' using errcode = '23505';
  end if;
  perform pr.id from public.presentaciones pr join public.productos p on p.id = pr.producto_id join public.categorias c on c.id = p.categoria_id where pr.id in (select (linea->>'presentacion_id')::integer from jsonb_array_elements(v_lineas_normalizadas) linea) order by pr.id for update of pr, p, c;
  select jsonb_build_object('requiere_revision_precio', true, 'valor_total_productos', coalesce(sum((linea->>'cantidad')::integer * coalesce(pr.precio_promocional, pr.precio_normal)), 0), 'lineas', coalesce(jsonb_agg(jsonb_build_object('presentacion_id', pr.id, 'producto', p.nombre, 'presentacion', pr.etiqueta, 'cantidad', (linea->>'cantidad')::integer, 'precio_esperado', (linea->>'precio_esperado')::integer, 'precio_unitario', coalesce(pr.precio_promocional, pr.precio_normal), 'subtotal', (linea->>'cantidad')::integer * coalesce(pr.precio_promocional, pr.precio_normal)) order by pr.id) filter (where (linea->>'precio_esperado')::integer <> coalesce(pr.precio_promocional, pr.precio_normal)), '[]'::jsonb)) into v_resumen_cambio_precio from jsonb_array_elements(p_lineas) linea join public.presentaciones pr on pr.id = (linea->>'presentacion_id')::integer join public.productos p on p.id = pr.producto_id;
  if jsonb_array_length(v_resumen_cambio_precio->'lineas') > 0 then return v_resumen_cambio_precio; end if;
  select terminos_version, politica_datos_version into v_terminos_version, v_politica_datos_version from public.versiones_legales_vigentes();
  begin
    insert into public.solicitudes (codigo, identificador_intento, nombre_cliente, telefono, ciudad, observaciones, terminos_version, politica_datos_version, aceptado_en) values ('ES-' || lpad(nextval('public.solicitudes_codigo_seq')::text, 5, '0'), p_identificador_intento, v_nombre_cliente, v_telefono, v_ciudad, v_observaciones, v_terminos_version, v_politica_datos_version, now()) returning id into v_solicitud_id;
    insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario) select v_solicitud_id, (linea->>'presentacion_id')::integer, (linea->>'cantidad')::integer, coalesce(pr.precio_promocional, pr.precio_normal) from jsonb_array_elements(v_lineas_normalizadas) linea join public.presentaciones pr on pr.id = (linea->>'presentacion_id')::integer join public.productos p on p.id = pr.producto_id join public.categorias c on c.id = p.categoria_id where p.activo and c.activo and p.nombre <> '' and p.descripcion <> '' and pr.activo and exists (select 1 from public.imagenes_producto i where i.producto_id = p.id) and (pr.modo_disponibilidad = 'bajo_pedido' or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock >= (linea->>'cantidad')::integer));
    get diagnostics v_detalles_insertados = row_count;
    if v_detalles_insertados <> v_cantidad_lineas then raise exception 'Una o mas presentaciones ya no estan disponibles con la cantidad solicitada' using errcode = '22023'; end if;
    insert into public.pagos_solicitud (solicitud_id, monto) select v_solicitud_id, sum(subtotal)::integer from public.detalles_solicitud where solicitud_id = v_solicitud_id;
  exception when unique_violation then
    select * into v_solicitud from public.solicitudes s where s.identificador_intento = p_identificador_intento;
    if found then
      select jsonb_agg(jsonb_build_object('presentacion_id', d.presentacion_id, 'cantidad', d.cantidad) order by d.presentacion_id) into v_lineas_existentes from public.detalles_solicitud d where d.solicitud_id = v_solicitud.id;
      if v_solicitud.nombre_cliente = v_nombre_cliente and v_solicitud.telefono = v_telefono and v_solicitud.ciudad is not distinct from v_ciudad and v_solicitud.observaciones is not distinct from v_observaciones and v_lineas_existentes = v_lineas_normalizadas then return public.respuesta_registro_solicitud(v_solicitud.id); end if;
    end if;
    raise exception 'El identificador de intento ya fue usado con contenido diferente' using errcode = '23505';
  end;
  return public.respuesta_registro_solicitud(v_solicitud_id);
end;
$$;

create or replace function public.obtener_solicitud_publica_segura(p_codigo text, p_token_cliente uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_resultado jsonb;
begin
  select jsonb_build_object(
    'codigo', s.codigo, 'creado_en', s.creado_en, 'estado', s.estado,
    'lineas', coalesce(jsonb_agg(jsonb_build_object('producto', prd.nombre, 'presentacion', p.etiqueta, 'cantidad', d.cantidad, 'precio_unitario', d.precio_unitario, 'subtotal', d.subtotal) order by d.id), '[]'::jsonb),
    'valor_total_productos', sum(d.subtotal), 'pago_estado', ps.estado,
    'pago_monto', ps.monto,
    'razon_rechazo', case when ps.estado = 'rechazado' then ps.observacion_revision else null end,
    'elegible_pago', s.estado = 'nueva' and ps.estado in ('pendiente', 'rechazado') and not exists (
      select 1 from public.detalles_solicitud dx join public.presentaciones px on px.id = dx.presentacion_id join public.productos prx on prx.id = px.producto_id join public.categorias cx on cx.id = prx.categoria_id
      where dx.solicitud_id = s.id and (not cx.activo or not prx.activo or not px.activo or px.modo_disponibilidad <> 'venta_inmediata' or px.stock < dx.cantidad)
    )
  ) into v_resultado
  from public.solicitudes s join public.detalles_solicitud d on d.solicitud_id = s.id join public.presentaciones p on p.id = d.presentacion_id join public.productos prd on prd.id = p.producto_id join public.pagos_solicitud ps on ps.solicitud_id = s.id
  where s.codigo = btrim(coalesce(p_codigo, '')) and s.token_cliente = p_token_cliente
  group by s.id, s.codigo, s.creado_en, s.estado, ps.estado, ps.monto, ps.observacion_revision;
  if v_resultado is null then raise exception 'No se encontro una solicitud con esas credenciales' using errcode = '22023'; end if;
  return v_resultado;
end;
$$;

-- This service-role-only RPC is the Edge Function's second authorization check before upload metadata is recorded.
create or replace function public.validar_envio_comprobante_pago(p_codigo text, p_token_cliente uuid)
returns table (solicitud_id integer, monto integer) language plpgsql security definer set search_path = '' as $$
declare v_publico jsonb;
begin
  v_publico := public.obtener_solicitud_publica_segura(p_codigo, p_token_cliente);
  if not coalesce((v_publico->>'elegible_pago')::boolean, false) then raise exception 'La solicitud ya no admite comprobantes' using errcode = '22023'; end if;
  return query select s.id, ps.monto from public.solicitudes s join public.pagos_solicitud ps on ps.solicitud_id = s.id where s.codigo = btrim(p_codigo) and s.token_cliente = p_token_cliente;
end;
$$;

create or replace function public.registrar_comprobante_pago_desde_edge(p_codigo text, p_token_cliente uuid, p_path text, p_mime text, p_bytes integer, p_nombre_original text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_solicitud public.solicitudes%rowtype; v_pago public.pagos_solicitud%rowtype; v_monto integer;
begin
  select * into v_solicitud from public.solicitudes where codigo = btrim(coalesce(p_codigo, '')) and token_cliente = p_token_cliente for update;
  if not found then raise exception 'No se encontro una solicitud con esas credenciales' using errcode = '22023'; end if;
  select * into v_pago from public.pagos_solicitud where solicitud_id = v_solicitud.id for update;
  select sum(subtotal)::integer into v_monto from public.detalles_solicitud where solicitud_id = v_solicitud.id;
  if v_solicitud.estado <> 'nueva' or v_pago.estado not in ('pendiente', 'rechazado') then raise exception 'La solicitud ya no admite comprobantes' using errcode = '22023'; end if;
  if exists (select 1 from public.detalles_solicitud d join public.presentaciones p on p.id = d.presentacion_id join public.productos pr on pr.id = p.producto_id join public.categorias c on c.id = pr.categoria_id where d.solicitud_id = v_solicitud.id and (not c.activo or not pr.activo or not p.activo or p.modo_disponibilidad <> 'venta_inmediata' or p.stock < d.cantidad)) then raise exception 'La disponibilidad cambio antes de enviar el comprobante' using errcode = '22023'; end if;
  if v_pago.monto <> v_monto then update public.pagos_solicitud set monto = v_monto where id = v_pago.id; end if;
  update public.pagos_solicitud set estado = 'comprobante_enviado', comprobante_path = p_path, comprobante_mime = p_mime, comprobante_bytes = p_bytes, comprobante_nombre_original = nullif(left(btrim(coalesce(p_nombre_original, '')), 255), ''), enviado_en = now(), revisado_en = null, revisado_por = null, observacion_revision = null where id = v_pago.id;
end;
$$;

create or replace function public.bloquear_edicion_con_comprobante()
returns trigger language plpgsql set search_path = '' as $$
declare v_solicitud_id integer := coalesce(new.solicitud_id, old.solicitud_id);
begin
  -- Confirmation records the inventory deduction without changing the paid line itself.
  if (
    tg_op = 'DELETE'
    or new.solicitud_id is distinct from old.solicitud_id
    or new.presentacion_id is distinct from old.presentacion_id
    or new.cantidad is distinct from old.cantidad
    or new.precio_unitario is distinct from old.precio_unitario
  ) and exists (select 1 from public.pagos_solicitud where solicitud_id = v_solicitud_id and estado in ('comprobante_enviado', 'verificado')) then
    raise exception 'Existe un comprobante pendiente o verificado; primero debe resolverse el pago' using errcode = '22023';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger detalles_solicitud_bloquear_edicion_con_comprobante
before update or delete on public.detalles_solicitud
for each row execute function public.bloquear_edicion_con_comprobante();

create or replace function public.actualizar_solicitud_nueva(p_solicitud_id integer, p_nombre_cliente text, p_telefono text, p_ciudad text, p_observaciones text, p_lineas jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_solicitud public.solicitudes%rowtype;
  v_nombre_cliente text := btrim(coalesce(p_nombre_cliente, ''));
  v_telefono text := btrim(coalesce(p_telefono, ''));
  v_ciudad text := nullif(btrim(coalesce(p_ciudad, '')), '');
  v_observaciones text := nullif(btrim(coalesce(p_observaciones, '')), '');
  v_digitos_telefono text;
  v_cantidad_lineas integer;
  v_pago_estado text;
begin
  if not (select public.es_administrador_activo()) then raise exception 'No tienes permisos para actualizar solicitudes' using errcode = '42501'; end if;
  select estado into v_pago_estado from public.pagos_solicitud where solicitud_id = p_solicitud_id;
  if v_pago_estado in ('comprobante_enviado', 'verificado') then raise exception 'Existe un comprobante pendiente o verificado; primero debe resolverse el pago' using errcode = '22023'; end if;
  if char_length(v_nombre_cliente) not between 2 and 100 then raise exception 'El nombre debe tener entre 2 y 100 caracteres' using errcode = '22023'; end if;
  if v_telefono !~ '^[0-9+() -]+$' then raise exception 'El telefono contiene caracteres no permitidos' using errcode = '22023'; end if;
  v_digitos_telefono := regexp_replace(v_telefono, '[^0-9]', '', 'g');
  if char_length(v_digitos_telefono) not between 7 and 15 then raise exception 'El telefono debe contener entre 7 y 15 digitos' using errcode = '22023'; end if;
  if v_ciudad is not null and char_length(v_ciudad) > 100 then raise exception 'La ciudad no puede superar 100 caracteres' using errcode = '22023'; end if;
  if v_observaciones is not null and char_length(v_observaciones) > 500 then raise exception 'Las observaciones no pueden superar 500 caracteres' using errcode = '22023'; end if;
  if p_lineas is null or jsonb_typeof(p_lineas) <> 'array' or jsonb_array_length(p_lineas) = 0 then raise exception 'La solicitud debe conservar al menos una linea' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_lineas) linea where jsonb_typeof(linea) <> 'object' or linea - 'detalle_id' - 'cantidad' <> '{}'::jsonb or coalesce(linea->>'detalle_id', '') !~ '^[1-9][0-9]*$' or char_length(coalesce(linea->>'detalle_id', '')) > 10 or coalesce(linea->>'cantidad', '') !~ '^[1-9][0-9]?$') then raise exception 'Las lineas de solicitud no son validas' using errcode = '22023'; end if;
  select count(*) into v_cantidad_lineas from jsonb_array_elements(p_lineas);
  if v_cantidad_lineas > 50 then raise exception 'La solicitud no puede superar 50 lineas' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_array_elements(p_lineas) linea group by (linea->>'detalle_id')::integer having count(*) > 1) then raise exception 'No se puede repetir un detalle de solicitud' using errcode = '22023'; end if;
  select * into v_solicitud from public.solicitudes s where s.id = p_solicitud_id for update;
  if not found then raise exception 'La solicitud no existe' using errcode = '22023'; end if;
  if v_solicitud.estado <> 'nueva' then raise exception 'Solo las solicitudes Nuevas pueden editarse' using errcode = '22023'; end if;
  if (select count(*) from jsonb_array_elements(p_lineas) linea join public.detalles_solicitud d on d.id = (linea->>'detalle_id')::integer and d.solicitud_id = v_solicitud.id) <> v_cantidad_lineas then raise exception 'Las lineas deben pertenecer a la solicitud existente' using errcode = '22023'; end if;
  perform pr.id from jsonb_array_elements(p_lineas) linea join public.detalles_solicitud d on d.id = (linea->>'detalle_id')::integer join public.presentaciones pr on pr.id = d.presentacion_id where pr.modo_disponibilidad = 'venta_inmediata' order by pr.id for update of pr;
  if exists (select 1 from jsonb_array_elements(p_lineas) linea join public.detalles_solicitud d on d.id = (linea->>'detalle_id')::integer join public.presentaciones pr on pr.id = d.presentacion_id where pr.modo_disponibilidad = 'venta_inmediata' and pr.stock < (linea->>'cantidad')::integer) then raise exception 'La cantidad supera el stock disponible para venta inmediata' using errcode = '22023'; end if;
  update public.solicitudes set nombre_cliente = v_nombre_cliente, telefono = v_telefono, ciudad = v_ciudad, observaciones = v_observaciones where id = v_solicitud.id;
  update public.detalles_solicitud d set cantidad = (linea->>'cantidad')::integer from jsonb_array_elements(p_lineas) linea where d.solicitud_id = v_solicitud.id and d.id = (linea->>'detalle_id')::integer;
  delete from public.detalles_solicitud d where d.solicitud_id = v_solicitud.id and not exists (select 1 from jsonb_array_elements(p_lineas) linea where (linea->>'detalle_id')::integer = d.id);
end;
$$;

create or replace function public.confirmar_solicitud_compra_interna(p_solicitud_id integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_solicitud public.solicitudes%rowtype;
begin
  select * into v_solicitud from public.solicitudes where id = p_solicitud_id for update;
  if not found then raise exception 'La solicitud no existe' using errcode = '22023'; end if;
  if v_solicitud.estado <> 'nueva' then raise exception 'Solo las solicitudes Nuevas pueden confirmarse' using errcode = '22023'; end if;
  perform p.id from public.detalles_solicitud d join public.presentaciones p on p.id = d.presentacion_id where d.solicitud_id = v_solicitud.id order by p.id for update of p;
  if exists (select 1 from public.detalles_solicitud d join public.presentaciones p on p.id = d.presentacion_id join public.productos pr on pr.id = p.producto_id join public.categorias c on c.id = pr.categoria_id where d.solicitud_id = v_solicitud.id and (not c.activo or not pr.activo or not p.activo or p.modo_disponibilidad not in ('venta_inmediata', 'bajo_pedido') or (p.modo_disponibilidad = 'venta_inmediata' and p.stock < d.cantidad))) then raise exception 'La solicitud ya no cumple las condiciones para confirmarse' using errcode = '22023'; end if;
  update public.presentaciones p set stock = p.stock - d.cantidad from public.detalles_solicitud d where d.solicitud_id = v_solicitud.id and d.presentacion_id = p.id and p.modo_disponibilidad = 'venta_inmediata';
  update public.detalles_solicitud d set cantidad_descontada = case when p.modo_disponibilidad = 'venta_inmediata' then d.cantidad else 0 end from public.presentaciones p where d.solicitud_id = v_solicitud.id and d.presentacion_id = p.id;
  update public.solicitudes set estado = 'confirmada', confirmado_en = now() where id = v_solicitud.id;
end;
$$;

create or replace function public.confirmar_solicitud_compra(p_solicitud_id integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not (select public.es_administrador_activo()) then raise exception 'No tienes permisos para confirmar solicitudes' using errcode = '42501'; end if;
  if exists (select 1 from public.pagos_solicitud where solicitud_id = p_solicitud_id and estado <> 'pendiente') then raise exception 'El comprobante debe verificarse o rechazarse antes de confirmar la solicitud' using errcode = '22023'; end if;
  perform public.confirmar_solicitud_compra_interna(p_solicitud_id);
end;
$$;

create or replace function public.rechazar_comprobante_pago(p_solicitud_id integer, p_razon text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_razon text := btrim(coalesce(p_razon, ''));
begin
  if not (select public.es_administrador_activo()) then raise exception 'No tienes permisos para rechazar comprobantes' using errcode = '42501'; end if;
  if char_length(v_razon) not between 1 and 500 then raise exception 'Debes indicar una razon de rechazo de hasta 500 caracteres' using errcode = '22023'; end if;
  update public.pagos_solicitud ps set estado = 'rechazado', revisado_en = now(), revisado_por = auth.uid(), observacion_revision = v_razon where ps.solicitud_id = p_solicitud_id and ps.estado = 'comprobante_enviado' and exists (select 1 from public.solicitudes s where s.id = ps.solicitud_id and s.estado = 'nueva');
  if not found then raise exception 'No existe un comprobante enviado para rechazar' using errcode = '22023'; end if;
end;
$$;

create or replace function public.verificar_pago_y_confirmar_solicitud(p_solicitud_id integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_pago public.pagos_solicitud%rowtype; v_monto integer;
begin
  if not (select public.es_administrador_activo()) then raise exception 'No tienes permisos para verificar pagos' using errcode = '42501'; end if;
  select * into v_pago from public.pagos_solicitud where solicitud_id = p_solicitud_id for update;
  if not found or v_pago.estado <> 'comprobante_enviado' then raise exception 'No existe un comprobante enviado para verificar' using errcode = '22023'; end if;
  select sum(subtotal)::integer into v_monto from public.detalles_solicitud where solicitud_id = p_solicitud_id;
  if v_pago.monto <> v_monto then raise exception 'El monto del comprobante no coincide con la solicitud' using errcode = '22023'; end if;
  perform public.confirmar_solicitud_compra_interna(p_solicitud_id);
  update public.pagos_solicitud set estado = 'verificado', revisado_en = now(), revisado_por = auth.uid(), observacion_revision = null where id = v_pago.id;
end;
$$;

create or replace function public.obtener_comprobante_pago_admin(p_solicitud_id integer)
returns table (comprobante_path text, comprobante_mime text) language plpgsql stable security definer set search_path = '' as $$
begin
  if not (select public.es_administrador_activo()) then raise exception 'No tienes permisos para consultar comprobantes' using errcode = '42501'; end if;
  return query select ps.comprobante_path, ps.comprobante_mime from public.pagos_solicitud ps where ps.solicitud_id = p_solicitud_id and ps.comprobante_path is not null;
end;
$$;

revoke all on function public.obtener_solicitud_publica_segura(text, uuid) from public, anon, authenticated;
revoke all on function public.validar_envio_comprobante_pago(text, uuid) from public, anon, authenticated;
revoke all on function public.registrar_comprobante_pago_desde_edge(text, uuid, text, text, integer, text) from public, anon, authenticated;
revoke all on function public.confirmar_solicitud_compra_interna(integer) from public, anon, authenticated;
revoke all on function public.rechazar_comprobante_pago(integer, text) from public, anon, authenticated;
revoke all on function public.verificar_pago_y_confirmar_solicitud(integer) from public, anon, authenticated;
revoke all on function public.obtener_comprobante_pago_admin(integer) from public, anon, authenticated;
grant execute on function public.obtener_solicitud_publica_segura(text, uuid) to anon, authenticated;
grant execute on function public.validar_envio_comprobante_pago(text, uuid), public.registrar_comprobante_pago_desde_edge(text, uuid, text, text, integer, text) to service_role;
grant execute on function public.rechazar_comprobante_pago(integer, text), public.verificar_pago_y_confirmar_solicitud(integer), public.obtener_comprobante_pago_admin(integer) to authenticated;
