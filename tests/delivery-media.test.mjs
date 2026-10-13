import test from 'node:test';
import assert from 'node:assert/strict';
import { deliveryMediaPath, deliveryMediaType, removeDeliveryMedia, uploadDeliveryMedia, validateDeliveryMedia } from '../src/delivery-media.js';

const imageFile = (overrides = {}) => ({ type: 'image/jpeg', size: 1024, ...overrides });
const videoFile = (overrides = {}) => ({ type: 'video/mp4', size: 1024, ...overrides });

test('classifies and validates delivery images and videos', () => {
  assert.equal(deliveryMediaType(imageFile()), 'imagen');
  assert.equal(deliveryMediaType(videoFile()), 'video');
  assert.equal(deliveryMediaType({ type: 'application/pdf', size: 1 }), null);
  assert.throws(() => validateDeliveryMedia({ type: 'image/gif', size: 1 }), /JPG, PNG, WebP/);
  assert.throws(() => validateDeliveryMedia(imageFile({ size: 5 * 1024 * 1024 + 1 })), /5 MiB/);
  assert.throws(() => validateDeliveryMedia(videoFile({ size: 50 * 1024 * 1024 + 1 })), /50 MiB/);
  assert.doesNotThrow(() => validateDeliveryMedia(imageFile()));
  assert.doesNotThrow(() => validateDeliveryMedia(videoFile()));
});

test('builds a unique delivery media path with the MIME extension', () => {
  assert.equal(deliveryMediaPath(4, imageFile({ type: 'image/webp' }), () => 'uuid-1'), 'entregas/4/uuid-1.webp');
  assert.equal(deliveryMediaPath(4, videoFile({ type: 'video/quicktime' }), () => 'uuid-2'), 'entregas/4/uuid-2.mov');
});

function client({ insertError, removeError } = {}) {
  const calls = { uploads: [], removes: [], inserts: [] };
  return {
    calls,
    from: () => ({
      insert(data) { calls.inserts.push(data); return { select: () => ({ single: async () => ({ data: { id: 7, ...data }, error: insertError }) }) }; },
      delete() { return { eq: async () => ({ error: undefined }) }; },
    }),
    storage: {
      from: () => ({
        upload: async (path, file, options) => { calls.uploads.push({ path, file, options }); return { error: undefined }; },
        remove: async (paths) => { calls.removes.push(paths); return { error: removeError }; },
        getPublicUrl: (path) => ({ data: { publicUrl: `https://storage.test/${path}` } }),
      }),
    },
  };
}

test('uploads delivery media and stores its public record', async () => {
  const api = client();
  const record = await uploadDeliveryMedia(api, 4, videoFile(), 'Video entrega', 2, () => 'uuid-3');
  assert.equal(api.calls.uploads[0].path, 'entregas/4/uuid-3.mp4');
  assert.equal(record.tipo, 'video');
  assert.equal(record.posicion, 2);
  assert.equal(record.texto_alternativo, 'Video entrega');
  assert.match(record.url, /entregas\/4\/uuid-3\.mp4/);
});

test('removes the uploaded object when its record cannot be saved', async () => {
  const api = client({ insertError: { message: 'database failed' } });
  await assert.rejects(uploadDeliveryMedia(api, 4, imageFile(), '', 0, () => 'uuid-4'), /database failed/);
  assert.deepEqual(api.calls.removes, [['entregas/4/uuid-4.jpg']]);
});

test('removes the database record before its storage object', async () => {
  const api = client();
  await removeDeliveryMedia(api, { id: 7, identificador_externo: 'entregas/4/old.jpg' });
  assert.deepEqual(api.calls.removes, [['entregas/4/old.jpg']]);
});
