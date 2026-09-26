import test from 'node:test';
import assert from 'node:assert/strict';
import { imagePath, removeImage, replaceImage, updateImageAlt, uploadImage, validateImage } from '../src/images.js';

const imageFile = (overrides = {}) => ({ type: 'image/jpeg', size: 1024, ...overrides });

function client({ uploadError, insertError, updateError, deleteError, removeError } = {}) {
  const calls = { uploads: [], removes: [], inserts: [], updates: [], deletes: [] };
  const query = {
    insert(data) { calls.inserts.push(data); return { select: () => ({ single: async () => ({ data: { id: 9, ...data }, error: insertError }) }) }; },
    update(data) { calls.updates.push(data); return { eq: () => ({ select: () => ({ single: async () => ({ data: { id: 4, ...data }, error: updateError }) }) }) }; },
    delete() { return { eq: async (_, id) => { calls.deletes.push(id); return { error: deleteError || null }; } }; },
  };
  return {
    calls,
    from: () => query,
    storage: {
      from: () => ({
        upload: async (path, file, options) => { calls.uploads.push({ path, file, options }); return { error: uploadError }; },
        remove: async (paths) => { calls.removes.push(paths); return { error: removeError }; },
        getPublicUrl: (path) => ({ data: { publicUrl: `https://storage.test/${path}` } }),
      }),
    },
  };
}

test('rejects files outside the permitted MIME types and size limit', () => {
  assert.throws(() => validateImage(imageFile({ type: 'image/gif' })), /JPEG, PNG o WebP/);
  assert.throws(() => validateImage(imageFile({ size: 5 * 1024 * 1024 + 1 })), /5 MiB/);
});

test('builds a unique product image path with the MIME extension', () => {
  const path = imagePath(42, imageFile({ type: 'image/webp' }), () => 'uuid-123');
  assert.equal(path, 'productos/42/uuid-123.webp');
});

test('removes a newly uploaded object when its image record cannot be saved', async () => {
  const api = client({ insertError: { message: 'database failed' } });
  await assert.rejects(uploadImage(api, 8, imageFile(), 'Producto 8', () => 'uuid-1'), /database failed/);
  assert.deepEqual(api.calls.removes, [['productos/8/uuid-1.jpg']]);
});

test('replaces the database reference before removing the previous object', async () => {
  const api = client();
  await replaceImage(api, { id: 4, producto_id: 8, identificador_externo: 'productos/8/old.jpg' }, imageFile(), 'Producto 8', () => 'uuid-2');
  assert.equal(api.calls.updates[0].identificador_externo, 'productos/8/uuid-2.jpg');
  assert.deepEqual(api.calls.removes, [['productos/8/old.jpg']]);
});

test('updates alternative text without replacing the stored object', async () => {
  const api = client();
  await updateImageAlt(api, { id: 4 }, 'Aroma frontal');
  assert.deepEqual(api.calls.updates, [{ texto_alternativo: 'Aroma frontal' }]);
  assert.deepEqual(api.calls.uploads, []);
});

test('removes the new object when replacing its database reference fails', async () => {
  const api = client({ updateError: { message: 'database failed' } });
  await assert.rejects(replaceImage(api, { id: 4, producto_id: 8, identificador_externo: 'productos/8/old.jpg' }, imageFile(), 'Producto 8', () => 'uuid-3'), /database failed/);
  assert.deepEqual(api.calls.removes, [['productos/8/uuid-3.jpg']]);
});

test('removes the database reference before deleting its storage object', async () => {
  const api = client();
  await removeImage(api, { id: 4, identificador_externo: 'productos/8/old.jpg' });
  assert.deepEqual(api.calls.deletes, [4]);
  assert.deepEqual(api.calls.removes, [['productos/8/old.jpg']]);
});

test('keeps the storage object when deleting its database reference fails', async () => {
  const api = client({ deleteError: { message: 'database failed' } });
  await assert.rejects(removeImage(api, { id: 4, identificador_externo: 'productos/8/old.jpg' }), /database failed/);
  assert.deepEqual(api.calls.removes, []);
});

test('reports a recoverable cleanup path after a storage deletion failure', async () => {
  const api = client({ removeError: { message: 'storage failed' } });
  await assert.rejects(removeImage(api, { id: 4, identificador_externo: 'productos/8/old.jpg' }), (error) => error.cleanupPath === 'productos/8/old.jpg');
  assert.deepEqual(api.calls.deletes, [4]);
});
