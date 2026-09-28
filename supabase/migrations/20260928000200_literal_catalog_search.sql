create or replace function public.buscar_catalogo_publico(
  busqueda text default null, categoria integer default null,
  generos text[] default null, clasificaciones text[] default null,
  precio_minimo integer default null, precio_maximo integer default null
)
returns table (
  categoria_id integer, categoria_nombre text, producto_id integer, nombre text,
  descripcion text, marca text, genero text, familia_olfativa text,
  referencia text, clasificacion text, destacado boolean, imagen_url text,
  texto_alternativo text, precio_referencia integer, precio_normal_referencia integer,
  precio_desde boolean, disponibilidad text
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if (categoria is not null and categoria < 1)
    or (precio_minimo is not null and precio_minimo < 1)
    or (precio_maximo is not null and precio_maximo < 1)
    or (precio_minimo is not null and precio_maximo is not null and precio_minimo > precio_maximo)
    or (generos is not null and exists (select 1 from unnest(generos) g where g is null or g not in ('hombre', 'mujer', 'unisex')))
    or (clasificaciones is not null and exists (select 1 from unnest(clasificaciones) c where c is null or c not in ('original', 'uno_a_uno', 'inspiracion')))
  then
    raise exception 'Filtros invalidos' using errcode = '22023';
  end if;

  return query
  select catalogo.*
  from public.obtener_catalogo_publico() catalogo
  where (categoria is null or catalogo.categoria_id = categoria)
    and (nullif(btrim(busqueda), '') is null or
      translate(lower(catalogo.nombre), 'áéíóúüñ', 'aeiouun') like
      '%' || replace(replace(replace(translate(lower(btrim(busqueda)), 'áéíóúüñ', 'aeiouun'), '\', '\\'), '%', '\%'), '_', '\_') || '%' escape '\')
    and (generos is null or cardinality(generos) = 0 or catalogo.genero = any(generos))
    and (clasificaciones is null or cardinality(clasificaciones) = 0 or catalogo.clasificacion = any(clasificaciones))
    and ((precio_minimo is null and precio_maximo is null) or catalogo.producto_id is not null and exists (
      select 1 from public.presentaciones pr
      where pr.producto_id = catalogo.producto_id and pr.activo
        and (pr.modo_disponibilidad = 'bajo_pedido' or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock > 0))
        and (precio_minimo is null or coalesce(pr.precio_promocional, pr.precio_normal) >= precio_minimo)
        and (precio_maximo is null or coalesce(pr.precio_promocional, pr.precio_normal) <= precio_maximo)
    ));
end;
$$;
