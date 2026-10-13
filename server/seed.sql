-- Seed data PostgreSQL para VEHIMARCAS

INSERT INTO categorias (id, nombre, slug, descripcion) VALUES
(1, 'SUVs y Camionetas', 'suvs-camionetas', 'Vehículos familiares, todo terreno y SUVs de gran rendimiento.'),
(2, 'Automóviles y Sedanes', 'automoviles-sedanes', 'Vehículos urbanos, ejecutivos y confortables.'),
(3, 'Pick-ups y Trabajo', 'pickups-trabajo', 'Camionetas de alta capacidad de carga y tracción 4x4.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO productos (id, categoria_id, nombre, slug, descripcion, marca, modelo, clasificacion, destacado) VALUES
(1, 1, 'Toyota Fortuner SW4 2024', 'toyota-fortuner-sw4-2024', 'Toyota Fortuner SW4 versión 2.8 Turbo Diesel 4x4. Impecable estado, único dueño, mantenimiento en concesionario.', 'Toyota', 'Fortuner SW4 2.8 Diesel', 'usado', true),
(2, 2, 'Mazda 3 Grand Touring 2023', 'mazda-3-grand-touring-2023', 'Mazda 3 Grand Touring LX 2.0L Sedán Automático. Equipamiento premium, techo corredizo, sistema Bose.', 'Mazda', '3 Grand Touring 2.0', 'usado', true),
(3, 3, 'Chevrolet Hilux Double Cab 4x4 2022', 'chevrolet-hilux-double-cab-4x4-2022', 'Toyota Hilux 2.4 Diesel 4x4 Doble Cabina. Duraliner, tiro de arrastre y carpa plana incluidos.', 'Toyota', 'Hilux 2.4 Diesel 4x4', 'usado', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO presentaciones (id, producto_id, etiqueta, precio_normal, modo_disponibilidad, stock, maximo_solicitable) VALUES
(1, 1, 'Automática 4x4 Turbo Diesel', 245000000, 'venta_inmediata', 1, 1),
(2, 2, 'Automática Tiptronic 2.0L', 98000000, 'venta_inmediata', 1, 1),
(3, 3, 'Mecánica 6 Vel 4x4', 165000000, 'venta_inmediata', 1, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO imagenes_producto (id, producto_id, url, texto_alternativo, posicion, es_principal) VALUES
(1, 1, '/assets/categories/suv-fortuner.jpg', 'Toyota Fortuner SW4 2024 Frontal', 0, true),
(2, 2, '/assets/categories/sedan-mazda3.jpg', 'Mazda 3 Grand Touring 2023 Frontal', 0, true),
(3, 3, '/assets/categories/pickup-hilux.jpg', 'Hilux Double Cab 4x4 2022 Lateral', 0, true)
ON CONFLICT (id) DO NOTHING;
