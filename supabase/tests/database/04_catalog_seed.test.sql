begin;

select plan(2);

select results_eq(
  $$select nombre from public.categorias order by nombre$$,
  $$values
      ('Cremas'::text),
      ('Humidificadores'::text),
      ('Otros productos'::text),
      ('Perfumes / Lociones'::text),
      ('Splash'::text)$$,
  'Existen exactamente las cinco categorias iniciales'
);

select results_eq(
  $$select count(*)::bigint from public.categorias where activo$$,
  $$values (5::bigint)$$,
  'Las categorias iniciales estan activas'
);

select * from finish();
rollback;
