create or replace function public.ordenar_imagenes_producto(
  p_producto_id integer,
  p_imagen_ids integer[]
)
returns setof public.imagenes_producto
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
begin
  if not (select public.es_administrador_activo()) then
    raise exception 'No tienes permisos para ordenar imagenes' using errcode = '42501';
  end if;

  if p_imagen_ids is null
    or cardinality(p_imagen_ids) <> cardinality(array(select distinct unnest(p_imagen_ids))) then
    raise exception 'El orden de imagenes no es valido' using errcode = '22023';
  end if;

  perform id
  from public.imagenes_producto
  where producto_id = p_producto_id
  order by id
  for update;

  select count(*) into v_total
  from public.imagenes_producto
  where producto_id = p_producto_id;

  if v_total <> cardinality(p_imagen_ids)
    or exists (
      select 1 from unnest(p_imagen_ids) image_id
      where not exists (
        select 1 from public.imagenes_producto
        where id = image_id and producto_id = p_producto_id
      )
    ) then
    raise exception 'Las imagenes no pertenecen al producto indicado' using errcode = '22023';
  end if;

  update public.imagenes_producto
  set posicion = posicion + v_total + 1
  where producto_id = p_producto_id;

  update public.imagenes_producto image
  set posicion = ordered.position - 1
  from unnest(p_imagen_ids) with ordinality as ordered(image_id, position)
  where image.id = ordered.image_id;

  return query
  select * from public.imagenes_producto
  where producto_id = p_producto_id
  order by posicion, id;
end;
$$;

revoke all on function public.ordenar_imagenes_producto(integer, integer[]) from public;
grant execute on function public.ordenar_imagenes_producto(integer, integer[]) to authenticated;
