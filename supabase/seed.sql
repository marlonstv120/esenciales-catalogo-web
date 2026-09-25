insert into public.categorias (nombre)
select categoria.nombre
from (
  values
    ('Perfumes / Lociones'::text),
    ('Splash'::text),
    ('Cremas'::text),
    ('Humidificadores'::text),
    ('Otros productos'::text)
) as categoria(nombre)
where not exists (
  select 1
  from public.categorias existente
  where lower(existente.nombre) = lower(categoria.nombre)
);
