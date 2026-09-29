-- Replace the public RPC contracts before removing the column they depend on.
-- Reuse their current definitions to preserve pricing, filtering and publication rules.
do $migration$
declare
  catalog_definition text;
  detail_definition text;
  search_definition text;
begin
  catalog_definition := pg_get_functiondef('public.obtener_catalogo_publico()'::regprocedure);
  detail_definition := pg_get_functiondef('public.obtener_producto_publico(integer)'::regprocedure);
  search_definition := pg_get_functiondef('public.buscar_catalogo_publico(text,integer,text[],text[],integer,integer)'::regprocedure);

  drop function public.buscar_catalogo_publico(text,integer,text[],text[],integer,integer);
  drop function public.obtener_producto_publico(integer);
  drop function public.obtener_catalogo_publico();

  catalog_definition := replace(catalog_definition, 'referencia text,', '');
  catalog_definition := replace(catalog_definition, 'p.referencia,', '');
  catalog_definition := replace(catalog_definition, 'publicables.referencia,', '');
  detail_definition := replace(detail_definition, '''referencia'', catalogo.referencia,', '');
  search_definition := replace(search_definition, 'referencia text,', '');

  execute catalog_definition;
  execute detail_definition;
  execute search_definition;
end;
$migration$;

revoke all on function public.obtener_catalogo_publico() from public, anon, authenticated;
grant execute on function public.obtener_catalogo_publico() to anon, authenticated;
revoke all on function public.obtener_producto_publico(integer) from public, anon, authenticated;
grant execute on function public.obtener_producto_publico(integer) to anon, authenticated;
revoke all on function public.buscar_catalogo_publico(text,integer,text[],text[],integer,integer) from public, anon, authenticated;
grant execute on function public.buscar_catalogo_publico(text,integer,text[],text[],integer,integer) to anon, authenticated;

drop index public.productos_referencia_unica;
alter table public.productos drop constraint productos_referencia_valida;
alter table public.productos drop column referencia;

create function public.verificar_familia_perfume()
returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (
    select 1 from public.categorias c
    where c.id = new.categoria_id and lower(c.nombre) = lower('Perfumes / Lociones')
  ) and new.familia_olfativa is null then
    raise exception 'La familia olfativa es obligatoria para Perfumes / Lociones'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger productos_verificar_familia_perfume
before insert or update on public.productos
for each row execute function public.verificar_familia_perfume();
