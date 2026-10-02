create or replace function public.versiones_legales_vigentes()
returns table (terminos_version text, politica_datos_version text)
language sql stable security definer set search_path = '' as $$
  select 'terminos-v2'::text, 'politica-datos-v2'::text;
$$;
