-- Schema oficial PostgreSQL para VEHIMARCAS

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    genero VARCHAR(50),
    clasificacion VARCHAR(50) NOT NULL DEFAULT 'usado',
    destacado BOOLEAN NOT NULL DEFAULT false,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS presentaciones (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    etiqueta VARCHAR(100) NOT NULL,
    precio_normal NUMERIC(12,2) NOT NULL CHECK (precio_normal >= 0),
    precio_promocional NUMERIC(12,2) CHECK (precio_promocional IS NULL OR precio_promocional >= 0),
    modo_disponibilidad VARCHAR(50) NOT NULL DEFAULT 'venta_inmediata',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    maximo_solicitable INTEGER NOT NULL DEFAULT 5 CHECK (maximo_solicitable >= 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS imagenes_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    identificador_externo TEXT,
    texto_alternativo VARCHAR(255),
    posicion INTEGER NOT NULL DEFAULT 0,
    es_principal BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solicitudes_compra (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    ciudad VARCHAR(100),
    observaciones TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'nueva',
    pago_estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    elegible_pago BOOLEAN NOT NULL DEFAULT true,
    razon_rechazo TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalles_solicitud (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes_compra(id) ON DELETE CASCADE,
    presentacion_id INTEGER REFERENCES presentaciones(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS pagos_solicitud (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes_compra(id) ON DELETE CASCADE,
    estado VARCHAR(30) NOT NULL DEFAULT 'comprobante_enviado',
    comprobante_path TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios_admin (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'admin',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW vehiculos AS
SELECT 
    p.id,
    p.nombre,
    p.marca,
    p.modelo,
    p.descripcion,
    p.clasificacion AS estado,
    c.nombre AS categoria,
    COALESCE(pr.precio_promocional, pr.precio_normal) AS precio,
    COALESCE(img.url, '/assets/home/sedan.jpg') AS imagen_url,
    p.creado_en
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN presentaciones pr ON pr.producto_id = p.id AND pr.activo = true
LEFT JOIN imagenes_producto img ON img.producto_id = p.id AND img.es_principal = true;