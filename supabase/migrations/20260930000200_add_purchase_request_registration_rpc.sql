create or replace function public.versiones_legales_vigentes()
returns table (terminos_version text, politica_datos_version text)
language sql
stable
security definer
set search_path = ''
as $$
  select 'terminos-v1'::text, 'politica-datos-v1'::text;
$$;

revoke all on function public.versiones_legales_vigentes() from public, anon, authenticated;

create or replace function public.respuesta_registro_solicitud(solicitud_id integer)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'codigo', s.codigo,
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
  group by s.id, s.codigo, s.estado;
$$;

revoke all on function public.respuesta_registro_solicitud(integer) from public, anon, authenticated;

create or replace function public.registrar_solicitud_compra(
  p_identificador_intento uuid,
  p_nombre_cliente text,
  p_telefono text,
  p_ciudad text,
  p_observaciones text,
  p_lineas jsonb,
  p_acepta_terminos boolean,
  p_acepta_politica_datos boolean
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
  if p_identificador_intento is null then
    raise exception 'El identificador de intento es obligatorio' using errcode = '22023';
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

  if p_acepta_terminos is not true or p_acepta_politica_datos is not true then
    raise exception 'Debes aceptar los terminos y la politica de datos' using errcode = '22023';
  end if;

  if p_lineas is null or jsonb_typeof(p_lineas) <> 'array' or jsonb_array_length(p_lineas) = 0 then
    raise exception 'La solicitud debe tener al menos una linea' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_lineas) linea
    where jsonb_typeof(linea) <> 'object'
      or coalesce(linea->>'presentacion_id', '') !~ '^[1-9][0-9]*$'
      or char_length(coalesce(linea->>'presentacion_id', '')) > 10
      or coalesce(linea->>'cantidad', '') !~ '^[1-9][0-9]?$'
      or coalesce(linea->>'precio_esperado', '') !~ '^[1-9][0-9]*$'
      or char_length(coalesce(linea->>'precio_esperado', '')) > 10
  ) then
    raise exception 'Las lineas de solicitud no son validas' using errcode = '22023';
  end if;

  select count(*) into v_cantidad_lineas
  from jsonb_array_elements(p_lineas);

  if v_cantidad_lineas > 50 then
    raise exception 'La solicitud no puede superar 50 lineas' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_lineas) linea
    group by (linea->>'presentacion_id')::integer
    having count(*) > 1
  ) then
    raise exception 'No se puede repetir una presentacion en la solicitud' using errcode = '22023';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'presentacion_id', (linea->>'presentacion_id')::integer,
      'cantidad', (linea->>'cantidad')::integer
    ) order by (linea->>'presentacion_id')::integer
  ) into v_lineas_normalizadas
  from jsonb_array_elements(p_lineas) linea;

  select * into v_solicitud
  from public.solicitudes s
  where s.identificador_intento = p_identificador_intento;

  if found then
    select jsonb_agg(
      jsonb_build_object('presentacion_id', d.presentacion_id, 'cantidad', d.cantidad)
      order by d.presentacion_id
    ) into v_lineas_existentes
    from public.detalles_solicitud d
    where d.solicitud_id = v_solicitud.id;

    if v_solicitud.nombre_cliente = v_nombre_cliente
      and v_solicitud.telefono = v_telefono
      and v_solicitud.ciudad is not distinct from v_ciudad
      and v_solicitud.observaciones is not distinct from v_observaciones
      and v_lineas_existentes = v_lineas_normalizadas
    then
      return public.respuesta_registro_solicitud(v_solicitud.id);
    end if;

    raise exception 'El identificador de intento ya fue usado con contenido diferente' using errcode = '23505';
  end if;

  -- Evita que el catalogo cambie entre la revalidacion y la insercion.
  perform pr.id
  from public.presentaciones pr
  join public.productos p on p.id = pr.producto_id
  join public.categorias c on c.id = p.categoria_id
  where pr.id in (
    select (linea->>'presentacion_id')::integer
    from jsonb_array_elements(v_lineas_normalizadas) linea
  )
  order by pr.id
  for update of pr, p, c;

  select jsonb_build_object(
    'requiere_revision_precio', true,
    'valor_total_productos', coalesce(sum((linea->>'cantidad')::integer * coalesce(pr.precio_promocional, pr.precio_normal)), 0),
    'lineas', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'presentacion_id', pr.id,
          'producto', p.nombre,
          'presentacion', pr.etiqueta,
          'cantidad', (linea->>'cantidad')::integer,
          'precio_esperado', (linea->>'precio_esperado')::integer,
          'precio_unitario', coalesce(pr.precio_promocional, pr.precio_normal),
          'subtotal', (linea->>'cantidad')::integer * coalesce(pr.precio_promocional, pr.precio_normal)
        )
        order by pr.id
      ) filter (where (linea->>'precio_esperado')::integer <> coalesce(pr.precio_promocional, pr.precio_normal)),
      '[]'::jsonb
    )
  ) into v_resumen_cambio_precio
  from jsonb_array_elements(p_lineas) linea
  join public.presentaciones pr on pr.id = (linea->>'presentacion_id')::integer
  join public.productos p on p.id = pr.producto_id;

  if jsonb_array_length(v_resumen_cambio_precio->'lineas') > 0 then
    return v_resumen_cambio_precio;
  end if;

  select terminos_version, politica_datos_version
  into v_terminos_version, v_politica_datos_version
  from public.versiones_legales_vigentes();

  begin
    insert into public.solicitudes (
      codigo, identificador_intento, nombre_cliente, telefono, ciudad, observaciones,
      terminos_version, politica_datos_version, aceptado_en
    ) values (
      'ES-' || lpad(nextval('public.solicitudes_codigo_seq')::text, 5, '0'),
      p_identificador_intento, v_nombre_cliente, v_telefono, v_ciudad, v_observaciones,
      v_terminos_version, v_politica_datos_version, now()
    ) returning id into v_solicitud_id;

    insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario)
    select
      v_solicitud_id,
      (linea->>'presentacion_id')::integer,
      (linea->>'cantidad')::integer,
      coalesce(pr.precio_promocional, pr.precio_normal)
    from jsonb_array_elements(v_lineas_normalizadas) linea
    join public.presentaciones pr on pr.id = (linea->>'presentacion_id')::integer
    join public.productos p on p.id = pr.producto_id
    join public.categorias c on c.id = p.categoria_id
    where p.activo
      and c.activo
      and p.nombre <> ''
      and p.descripcion <> ''
      and pr.activo
      and exists (select 1 from public.imagenes_producto i where i.producto_id = p.id)
      and (
        pr.modo_disponibilidad = 'bajo_pedido'
        or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock >= (linea->>'cantidad')::integer)
      );

    get diagnostics v_detalles_insertados = row_count;
    if v_detalles_insertados <> v_cantidad_lineas then
      raise exception 'Una o mas presentaciones ya no estan disponibles con la cantidad solicitada' using errcode = '22023';
    end if;
  exception when unique_violation then
    select * into v_solicitud
    from public.solicitudes s
    where s.identificador_intento = p_identificador_intento;

    if found then
      select jsonb_agg(
        jsonb_build_object('presentacion_id', d.presentacion_id, 'cantidad', d.cantidad)
        order by d.presentacion_id
      ) into v_lineas_existentes
      from public.detalles_solicitud d
      where d.solicitud_id = v_solicitud.id;

      if v_solicitud.nombre_cliente = v_nombre_cliente
        and v_solicitud.telefono = v_telefono
        and v_solicitud.ciudad is not distinct from v_ciudad
        and v_solicitud.observaciones is not distinct from v_observaciones
        and v_lineas_existentes = v_lineas_normalizadas
      then
        return public.respuesta_registro_solicitud(v_solicitud.id);
      end if;
    end if;

    raise exception 'El identificador de intento ya fue usado con contenido diferente' using errcode = '23505';
  end;

  return public.respuesta_registro_solicitud(v_solicitud_id);
end;
$$;

revoke all on function public.registrar_solicitud_compra(uuid, text, text, text, text, jsonb, boolean, boolean) from public, anon, authenticated;
grant execute on function public.registrar_solicitud_compra(uuid, text, text, text, text, jsonb, boolean, boolean) to anon, authenticated;
