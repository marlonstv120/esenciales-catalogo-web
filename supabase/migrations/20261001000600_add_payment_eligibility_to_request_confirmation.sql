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
    'pago_estado', ps.estado,
    'elegible_pago', s.estado = 'nueva' and ps.estado in ('pendiente', 'rechazado') and not exists (
      select 1
      from public.detalles_solicitud dx
      join public.presentaciones px on px.id = dx.presentacion_id
      join public.productos prx on prx.id = px.producto_id
      join public.categorias cx on cx.id = prx.categoria_id
      where dx.solicitud_id = s.id
        and (not cx.activo or not prx.activo or not px.activo or px.modo_disponibilidad <> 'venta_inmediata' or px.stock < dx.cantidad)
    ),
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
  join public.pagos_solicitud ps on ps.solicitud_id = s.id
  where s.id = $1
  group by s.id, s.codigo, s.token_cliente, s.estado, ps.estado;
$$;
