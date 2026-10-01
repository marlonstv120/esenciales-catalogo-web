create or replace function public.confirmar_solicitud_compra(p_solicitud_id integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_solicitud public.solicitudes%rowtype;
begin
  if not (select public.es_administrador_activo()) then
    raise exception 'No tienes permisos para confirmar solicitudes' using errcode = '42501';
  end if;

  select * into v_solicitud
  from public.solicitudes
  where id = p_solicitud_id
  for update;

  if not found then
    raise exception 'La solicitud no existe' using errcode = '22023';
  end if;

  if v_solicitud.estado <> 'nueva' then
    raise exception 'Solo las solicitudes Nuevas pueden confirmarse' using errcode = '22023';
  end if;

  -- Use a stable lock order so concurrent confirmations and stock edits serialize safely.
  perform p.id
  from public.detalles_solicitud d
  join public.presentaciones p on p.id = d.presentacion_id
  where d.solicitud_id = v_solicitud.id
  order by p.id
  for update of p;

  if exists (
    select 1
    from public.detalles_solicitud d
    join public.presentaciones p on p.id = d.presentacion_id
    join public.productos pr on pr.id = p.producto_id
    join public.categorias c on c.id = pr.categoria_id
    where d.solicitud_id = v_solicitud.id
      and (
        not c.activo
        or not pr.activo
        or not p.activo
        or p.modo_disponibilidad not in ('venta_inmediata', 'bajo_pedido')
        or (p.modo_disponibilidad = 'venta_inmediata' and p.stock < d.cantidad)
      )
  ) then
    raise exception 'La solicitud ya no cumple las condiciones para confirmarse' using errcode = '22023';
  end if;

  update public.presentaciones p
  set stock = p.stock - d.cantidad
  from public.detalles_solicitud d
  where d.solicitud_id = v_solicitud.id
    and d.presentacion_id = p.id
    and p.modo_disponibilidad = 'venta_inmediata';

  update public.detalles_solicitud d
  set cantidad_descontada = case
    when p.modo_disponibilidad = 'venta_inmediata' then d.cantidad
    else 0
  end
  from public.presentaciones p
  where d.solicitud_id = v_solicitud.id
    and d.presentacion_id = p.id;

  update public.solicitudes
  set estado = 'confirmada', confirmado_en = now()
  where id = v_solicitud.id;
end;
$$;

create or replace function public.entregar_solicitud_compra(p_solicitud_id integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_solicitud public.solicitudes%rowtype;
begin
  if not (select public.es_administrador_activo()) then
    raise exception 'No tienes permisos para entregar solicitudes' using errcode = '42501';
  end if;

  select * into v_solicitud
  from public.solicitudes
  where id = p_solicitud_id
  for update;

  if not found then
    raise exception 'La solicitud no existe' using errcode = '22023';
  end if;

  if v_solicitud.estado <> 'confirmada' then
    raise exception 'Solo las solicitudes Confirmadas pueden entregarse' using errcode = '22023';
  end if;

  update public.solicitudes
  set estado = 'entregada', entregado_en = now()
  where id = v_solicitud.id;
end;
$$;

create or replace function public.cancelar_solicitud_compra(p_solicitud_id integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_solicitud public.solicitudes%rowtype;
begin
  if not (select public.es_administrador_activo()) then
    raise exception 'No tienes permisos para cancelar solicitudes' using errcode = '42501';
  end if;

  select * into v_solicitud
  from public.solicitudes
  where id = p_solicitud_id
  for update;

  if not found then
    raise exception 'La solicitud no existe' using errcode = '22023';
  end if;

  if v_solicitud.estado not in ('nueva', 'confirmada') then
    raise exception 'Solo las solicitudes Nuevas o Confirmadas pueden cancelarse' using errcode = '22023';
  end if;

  if v_solicitud.estado = 'confirmada' then
    -- Lock even inactive or reclassified presentations before restoring their original deduction.
    perform p.id
    from public.detalles_solicitud d
    join public.presentaciones p on p.id = d.presentacion_id
    where d.solicitud_id = v_solicitud.id
    order by p.id
    for update of p;

    update public.presentaciones p
    set stock = p.stock + d.cantidad_descontada
    from public.detalles_solicitud d
    where d.solicitud_id = v_solicitud.id
      and d.presentacion_id = p.id
      and d.cantidad_descontada > 0;
  end if;

  update public.solicitudes
  set estado = 'cancelada', cancelado_en = now()
  where id = v_solicitud.id;
end;
$$;

revoke all on function public.confirmar_solicitud_compra(integer) from public, anon, authenticated;
revoke all on function public.entregar_solicitud_compra(integer) from public, anon, authenticated;
revoke all on function public.cancelar_solicitud_compra(integer) from public, anon, authenticated;
grant execute on function public.confirmar_solicitud_compra(integer) to authenticated;
grant execute on function public.entregar_solicitud_compra(integer) to authenticated;
grant execute on function public.cancelar_solicitud_compra(integer) to authenticated;
