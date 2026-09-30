create or replace function public.actualizar_solicitud_nueva(
  p_solicitud_id integer,
  p_nombre_cliente text,
  p_telefono text,
  p_ciudad text,
  p_observaciones text,
  p_lineas jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_solicitud public.solicitudes%rowtype;
  v_nombre_cliente text := btrim(coalesce(p_nombre_cliente, ''));
  v_telefono text := btrim(coalesce(p_telefono, ''));
  v_ciudad text := nullif(btrim(coalesce(p_ciudad, '')), '');
  v_observaciones text := nullif(btrim(coalesce(p_observaciones, '')), '');
  v_digitos_telefono text;
  v_cantidad_lineas integer;
begin
  if not (select public.es_administrador_activo()) then
    raise exception 'No tienes permisos para actualizar solicitudes' using errcode = '42501';
  end if;

  if char_length(v_nombre_cliente) not between 2 and 100 then
    raise exception 'El nombre debe tener entre 2 y 100 caracteres' using errcode = '22023';
  end if;

  if v_telefono !~ '^[0-9+() -]+$' then
    raise exception 'El telefono contiene caracteres no permitidos' using errcode = '22023';
  end if;

  v_digitos_telefono := regexp_replace(v_telefono, '[^0-9]', '', 'g');
  if char_length(v_digitos_telefono) not between 7 and 15 then
    raise exception 'El telefono debe contener entre 7 y 15 digitos' using errcode = '22023';
  end if;

  if v_ciudad is not null and char_length(v_ciudad) > 100 then
    raise exception 'La ciudad no puede superar 100 caracteres' using errcode = '22023';
  end if;

  if v_observaciones is not null and char_length(v_observaciones) > 500 then
    raise exception 'Las observaciones no pueden superar 500 caracteres' using errcode = '22023';
  end if;

  if p_lineas is null or jsonb_typeof(p_lineas) <> 'array' or jsonb_array_length(p_lineas) = 0 then
    raise exception 'La solicitud debe conservar al menos una linea' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_lineas) linea
    where jsonb_typeof(linea) <> 'object'
      or linea - 'detalle_id' - 'cantidad' <> '{}'::jsonb
      or coalesce(linea->>'detalle_id', '') !~ '^[1-9][0-9]*$'
      or char_length(coalesce(linea->>'detalle_id', '')) > 10
      or coalesce(linea->>'cantidad', '') !~ '^[1-9][0-9]?$'
  ) then
    raise exception 'Las lineas de solicitud no son validas' using errcode = '22023';
  end if;

  select count(*) into v_cantidad_lineas from jsonb_array_elements(p_lineas);
  if v_cantidad_lineas > 50 then
    raise exception 'La solicitud no puede superar 50 lineas' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_lineas) linea
    group by (linea->>'detalle_id')::integer
    having count(*) > 1
  ) then
    raise exception 'No se puede repetir un detalle de solicitud' using errcode = '22023';
  end if;

  select * into v_solicitud
  from public.solicitudes s
  where s.id = p_solicitud_id
  for update;

  if not found then
    raise exception 'La solicitud no existe' using errcode = '22023';
  end if;

  if v_solicitud.estado <> 'nueva' then
    raise exception 'Solo las solicitudes Nuevas pueden editarse' using errcode = '22023';
  end if;

  if (
    select count(*)
    from jsonb_array_elements(p_lineas) linea
    join public.detalles_solicitud d
      on d.id = (linea->>'detalle_id')::integer
     and d.solicitud_id = v_solicitud.id
  ) <> v_cantidad_lineas then
    raise exception 'Las lineas deben pertenecer a la solicitud existente' using errcode = '22023';
  end if;

  -- Lock immediate-sale presentations so their stock check is consistent with this edit.
  perform pr.id
  from jsonb_array_elements(p_lineas) linea
  join public.detalles_solicitud d on d.id = (linea->>'detalle_id')::integer
  join public.presentaciones pr on pr.id = d.presentacion_id
  where pr.modo_disponibilidad = 'venta_inmediata'
  order by pr.id
  for update of pr;

  if exists (
    select 1
    from jsonb_array_elements(p_lineas) linea
    join public.detalles_solicitud d on d.id = (linea->>'detalle_id')::integer
    join public.presentaciones pr on pr.id = d.presentacion_id
    where pr.modo_disponibilidad = 'venta_inmediata'
      and pr.stock < (linea->>'cantidad')::integer
  ) then
    raise exception 'La cantidad supera el stock disponible para venta inmediata' using errcode = '22023';
  end if;

  update public.solicitudes
  set nombre_cliente = v_nombre_cliente,
      telefono = v_telefono,
      ciudad = v_ciudad,
      observaciones = v_observaciones
  where id = v_solicitud.id;

  update public.detalles_solicitud d
  set cantidad = (linea->>'cantidad')::integer
  from jsonb_array_elements(p_lineas) linea
  where d.solicitud_id = v_solicitud.id
    and d.id = (linea->>'detalle_id')::integer;

  delete from public.detalles_solicitud d
  where d.solicitud_id = v_solicitud.id
    and not exists (
      select 1
      from jsonb_array_elements(p_lineas) linea
      where (linea->>'detalle_id')::integer = d.id
    );
end;
$$;

revoke all on function public.actualizar_solicitud_nueva(integer, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.actualizar_solicitud_nueva(integer, text, text, text, text, jsonb) to authenticated;
