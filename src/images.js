const BUCKET = 'productos';
const MAX_SIZE = 5 * 1024 * 1024;
const extensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function operationError(error, cleanupPath) {
  const message = error?.message || 'No fue posible completar la operacion de imagen.';
  const result = new Error(message);
  if (cleanupPath) result.cleanupPath = cleanupPath;
  return result;
}

async function removeObject(client, path) {
  const { error } = await client.storage.from(BUCKET).remove([path]);
  if (error) throw operationError(error, path);
}

export function validateImage(file) {
  if (!file || !extensions[file.type]) throw new Error('Selecciona una imagen JPEG, PNG o WebP.');
  if (file.size > MAX_SIZE) throw new Error('La imagen no puede superar 5 MiB.');
}

export function imagePath(productId, file, uuid = () => crypto.randomUUID()) {
  validateImage(file);
  return `${BUCKET}/${productId}/${uuid()}.${extensions[file.type]}`;
}

export async function uploadImage(client, productId, file, altText, uuid) {
  const path = imagePath(productId, file, uuid);
  const storage = client.storage.from(BUCKET);
  const { error: uploadError } = await storage.upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw operationError(uploadError);

  const record = {
    producto_id: productId,
    url: storage.getPublicUrl(path).data.publicUrl,
    identificador_externo: path,
    texto_alternativo: altText?.trim() || null,
    posicion: 0,
  };
  const { data, error } = await client.from('imagenes_producto').insert(record).select().single();
  if (!error) return data;

  try {
    await removeObject(client, path);
  } catch (cleanupError) {
    throw operationError(error, cleanupError.cleanupPath);
  }
  throw operationError(error);
}

export async function replaceImage(client, image, file, altText, uuid) {
  const path = imagePath(image.producto_id, file, uuid);
  const storage = client.storage.from(BUCKET);
  const { error: uploadError } = await storage.upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw operationError(uploadError);

  const record = {
    url: storage.getPublicUrl(path).data.publicUrl,
    identificador_externo: path,
    texto_alternativo: altText?.trim() || null,
  };
  const { data, error } = await client.from('imagenes_producto').update(record).eq('id', image.id).select().single();
  if (error) {
    try {
      await removeObject(client, path);
    } catch (cleanupError) {
      throw operationError(error, cleanupError.cleanupPath);
    }
    throw operationError(error);
  }

  try {
    await removeObject(client, image.identificador_externo);
  } catch (cleanupError) {
    throw operationError(cleanupError, cleanupError.cleanupPath);
  }
  return data;
}

export async function updateImageAlt(client, image, altText) {
  const { data, error } = await client.from('imagenes_producto').update({ texto_alternativo: altText?.trim() || null }).eq('id', image.id).select().single();
  if (error) throw operationError(error);
  return data;
}

export async function removeImage(client, image) {
  const { error } = await client.from('imagenes_producto').delete().eq('id', image.id);
  if (error) throw operationError(error);
  await removeObject(client, image.identificador_externo);
}

export async function retryImageCleanup(client, path) {
  await removeObject(client, path);
}
