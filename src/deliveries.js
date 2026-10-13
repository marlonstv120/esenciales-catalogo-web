const trimOrNull = (value) => String(value || '').trim() || null;

const entregaColumns = 'id, producto_id, titulo, descripcion, publicado, creado_en, actualizado_en';
const mediaColumns = 'id, entrega_id, url, identificador_externo, tipo, texto_alternativo, posicion';
const productoResumen = 'id, nombre, marca, categoria_id, categorias(id, nombre)';

export function normalizeEntrega(values = {}) {
  return {
    producto_id: Number(values.producto_id),
    titulo: String(values.titulo || '').trim(),
    descripcion: trimOrNull(values.descripcion),
    publicado: values.publicado ?? true,
  };
}

export function listDeliveries(client) {
  return client
    .from('entregas')
    .select(`${entregaColumns}, archivos_entrega(${mediaColumns}), productos(${productoResumen})`)
    .order('creado_en', { ascending: false });
}

// Busca la galería de un vehículo. El backend local ignora los filtros de
// selección, así que filtramos en el cliente sobre el listado completo.
export async function findDeliveryByProduct(client, productoId, list = listDeliveries) {
  const { data, error } = await list(client);
  if (error) return { data: null, error };
  const matching = (data || []).find((delivery) => String(delivery.producto_id) === String(productoId)) || null;
  return { data: matching, error: null };
}

export function saveDelivery(client, id, values) {
  const data = normalizeEntrega(values);
  const query = client.from('entregas');
  return id
    ? query.update(data).eq('id', id).select(entregaColumns).single()
    : query.insert(data).select(entregaColumns).single();
}

export function deleteDelivery(client, id) {
  return client.from('entregas').delete().eq('id', id);
}

export function orderedDeliveryMedia(delivery) {
  return [...(delivery?.archivos_entrega || [])].sort((left, right) => left.posicion - right.posicion || left.id - right.id);
}

export function deliveryVehicleName(delivery) {
  return delivery?.productos?.nombre || delivery?.vehiculo || '';
}