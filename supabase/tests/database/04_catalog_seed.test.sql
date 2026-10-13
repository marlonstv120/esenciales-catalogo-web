begin;
set local search_path = public, extensions;

select plan(2);

select results_eq(
  $$select nombre from public.categorias order by nombre$$,
  $$values
      ('Automóviles'::text),
      ('Pick-ups & 4x4'::text),
      ('SUV & Camionetas'::text)$$,
  'Existen exactamente las tres categorias iniciales'
);

select results_eq(
  $$select count(*)::bigint from public.categorias where activo$$,
  $$values (3::bigint)$$,
  'Las categorias iniciales estan activas'
);

select * from finish();
rollback;
