const BUCKET = 'entregas';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const imageExtensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const videoExtensions = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

function operationError(error, cleanupPath) {
  const message = error?.message || 'No fue posible completar la operación con el archivo.';
  const result = new Error(message);
  if (cleanupPath) result.cleanupPath = cleanupPath;
  return result;
}

async function removeObject(client, path) {
  const { error } = await client.storage.from(BUCKET).remove([path]);
  if (error) throw operationError(error, path);
}

export function deliveryMediaType(file) {
  if (imageExtensions[file?.type]) return 'imagen';
  if (videoExtensions[file?.type]) return 'video';
  return null;
}

export function validateDeliveryMedia(file) {
  const type = deliveryMediaType(file);
  if (!type) throw new Error('Selecciona una imagen (JPG, PNG, WebP) o un video (MP4, WebM, MOV).');
  if (type === 'imagen' && file.size > MAX_IMAGE_SIZE) throw new Error('La imagen no puede superar 5 MiB.');
  if (type === 'video' && file.size > MAX_VIDEO_SIZE) throw new Error('El video no puede superar 50 MiB.');
}

export function deliveryMediaPath(entregaId, file, uuid = () => crypto.randomUUID()) {
  validateDeliveryMedia(file);
  const extension = imageExtensions[file.type] || videoExtensions[file.type];
  return `${BUCKET}/${entregaId}/${uuid()}.${extension}`;
}

export async function uploadDeliveryMedia(client, entregaId, file, altText, position = 0, uuid) {
  const path = deliveryMediaPath(entregaId, file, uuid);
  const tipo = deliveryMediaType(file);
  const storage = client.storage.from(BUCKET);
  const { data: uploadData, error: uploadError } = await storage.upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw operationError(uploadError);

  const publicUrl = uploadData?.url || storage.getPublicUrl(path)?.data?.publicUrl || path;

  const record = {
    entrega_id: entregaId,
    url: publicUrl,
    identificador_externo: path,
    tipo,
    texto_alternativo: altText?.trim() || null,
    posicion: position,
  };
  const { data, error } = await client.from('archivos_entrega').insert(record).select().single();
  if (!error && data) return data;
  if (!error) return { id: Date.now(), ...record };

  try {
    await removeObject(client, path);
  } catch (cleanupError) {
    throw operationError(error, cleanupError.cleanupPath);
  }
  throw operationError(error);
}

export async function removeDeliveryMedia(client, media) {
  const { error } = await client.from('archivos_entrega').delete().eq('id', media.id);
  if (error) throw operationError(error);
  await removeObject(client, media.identificador_externo);
}

export async function retryDeliveryMediaCleanup(client, path) {
  await removeObject(client, path);
}
