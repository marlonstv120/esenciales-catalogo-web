const trimOrNull = (value) => String(value || '').trim() || null;

export function normalizePurchaseRequest(values) {
  return {
    nombre_cliente: String(values.nombre_cliente || '').trim(),
    telefono: String(values.telefono || '').trim(),
    ciudad: trimOrNull(values.ciudad),
    observaciones: trimOrNull(values.observaciones),
    lineas: (values.lineas || []).map((linea) => ({ detalle_id: Number(linea.detalle_id), cantidad: Number(linea.cantidad) })),
  };
}

export function listPurchaseRequests(client) {
  return client.from('solicitudes').select('id, codigo, nombre_cliente, telefono, ciudad, observaciones, terminos_version, politica_datos_version, aceptado_en, estado, creado_en, actualizado_en, confirmado_en, entregado_en, cancelado_en, detalles_solicitud(id, presentacion_id, cantidad, precio_unitario, subtotal, cantidad_descontada, presentaciones(etiqueta, stock, modo_disponibilidad, productos(nombre)))').order('creado_en', { ascending: false });
}

export function savePurchaseRequest(client, requestId, values) {
  const data = normalizePurchaseRequest(values);
  return client.rpc('actualizar_solicitud_nueva', {
    p_solicitud_id: Number(requestId),
    p_nombre_cliente: data.nombre_cliente,
    p_telefono: data.telefono,
    p_ciudad: data.ciudad,
    p_observaciones: data.observaciones,
    p_lineas: data.lineas,
  });
}

export function transitionPurchaseRequest(client, requestId, transition) {
  const rpcByTransition = {
    confirm: 'confirmar_solicitud_compra',
    deliver: 'entregar_solicitud_compra',
    cancel: 'cancelar_solicitud_compra',
  };
  const rpc = rpcByTransition[transition];
  if (!rpc) throw new Error('La transición de solicitud no es válida.');
  return client.rpc(rpc, { p_solicitud_id: Number(requestId) });
}

export function filterPurchaseRequests(requests, { query = '', status = '' } = {}) {
  const normalized = String(query).trim().toLocaleLowerCase('es');
  return requests.filter((request) => (!status || request.estado === status) && (!normalized || [request.codigo, request.nombre_cliente, request.telefono].some((value) => String(value || '').toLocaleLowerCase('es').includes(normalized))));
}
