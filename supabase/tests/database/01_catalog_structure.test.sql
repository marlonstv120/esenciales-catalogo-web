begin;

select plan(46);

select has_table('public', 'usuarios_administrativos', 'Debe existir usuarios_administrativos');
select has_table('public', 'categorias', 'Debe existir categorias');
select has_table('public', 'productos', 'Debe existir productos');
select has_table('public', 'presentaciones', 'Debe existir presentaciones');
select has_table('public', 'imagenes_producto', 'Debe existir imagenes_producto');

select has_column('public', 'usuarios_administrativos', 'id', 'Administrador tiene id');
select col_type_is('public', 'usuarios_administrativos', 'id', 'uuid', 'Id administrativo usa UUID');
select has_pk('public', 'usuarios_administrativos', 'Administrador tiene clave primaria');
select has_fk('public', 'usuarios_administrativos', 'Administrador referencia auth.users');
select has_column('public', 'usuarios_administrativos', 'activo', 'Administrador tiene estado activo');
select has_column('public', 'usuarios_administrativos', 'creado_en', 'Administrador registra creacion');
select has_column('public', 'usuarios_administrativos', 'actualizado_en', 'Administrador registra actualizacion');
select has_trigger('public', 'usuarios_administrativos', 'usuarios_administrativos_actualizar_fecha', 'Administrador actualiza su marca de tiempo');
select has_column('public', 'categorias', 'id', 'Categoria tiene id');
select col_type_is('public', 'categorias', 'id', 'integer', 'Id de categoria usa integer');
select has_pk('public', 'categorias', 'Categoria tiene clave primaria');
select has_column('public', 'categorias', 'nombre', 'Categoria tiene nombre');
select has_column('public', 'categorias', 'activo', 'Categoria tiene estado activo');
select has_column('public', 'categorias', 'creado_en', 'Categoria registra creacion');
select has_column('public', 'categorias', 'actualizado_en', 'Categoria registra actualizacion');
select has_trigger('public', 'categorias', 'categorias_actualizar_fecha', 'Categoria actualiza su marca de tiempo');

select col_type_is('public', 'productos', 'id', 'integer', 'Id de producto usa integer');
select has_pk('public', 'productos', 'Producto tiene clave primaria');
select has_fk('public', 'productos', 'Producto referencia categoria');
select has_column('public', 'productos', 'descripcion', 'Producto tiene descripcion');
select has_column('public', 'productos', 'genero', 'Producto tiene genero opcional');
select has_column('public', 'productos', 'clasificacion', 'Producto tiene clasificacion opcional');
select has_column('public', 'productos', 'destacado', 'Producto tiene indicador destacado');
select has_index('public', 'productos', 'productos_categoria_id_idx', 'FK de producto tiene indice');
select has_index('public', 'productos', 'productos_referencia_unica', 'Referencia tiene indice unico');
select has_trigger('public', 'productos', 'productos_actualizar_fecha', 'Producto actualiza su marca de tiempo');

select col_type_is('public', 'presentaciones', 'id', 'integer', 'Id de presentacion usa integer');
select has_pk('public', 'presentaciones', 'Presentacion tiene clave primaria');
select has_fk('public', 'presentaciones', 'Presentacion referencia producto');
select has_column('public', 'presentaciones', 'precio_normal', 'Presentacion tiene precio normal');
select has_column('public', 'presentaciones', 'precio_promocional', 'Presentacion tiene precio promocional opcional');
select has_column('public', 'presentaciones', 'stock', 'Presentacion tiene stock');
select has_column('public', 'presentaciones', 'modo_disponibilidad', 'Presentacion tiene modo');
select has_index('public', 'presentaciones', 'presentaciones_producto_id_idx', 'FK de presentacion tiene indice');
select has_trigger('public', 'presentaciones', 'presentaciones_actualizar_fecha', 'Presentacion actualiza su marca de tiempo');

select col_type_is('public', 'imagenes_producto', 'id', 'integer', 'Id de imagen usa integer');
select has_pk('public', 'imagenes_producto', 'Imagen tiene clave primaria');
select has_fk('public', 'imagenes_producto', 'Imagen referencia producto');
select has_column('public', 'imagenes_producto', 'identificador_externo', 'Imagen conserva ruta de Storage');
select has_column('public', 'imagenes_producto', 'posicion', 'Imagen tiene posicion');
select has_index('public', 'imagenes_producto', 'imagenes_producto_producto_id_idx', 'FK de imagen tiene indice');

select * from finish();
rollback;
