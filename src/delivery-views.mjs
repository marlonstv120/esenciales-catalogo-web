import { uiIcon } from './ui-icons.mjs';
import { orderedDeliveryMedia } from './deliveries.js';

const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const imageIcon = uiIcon('image', { size: 18 });
const videoIcon = uiIcon('video', { size: 18 });
const plusIcon = uiIcon('plus', { size: 16 });
const trashIcon = uiIcon('trash-2', { size: 16 });

function mediaPreviewView(media) {
  const alt = media.texto_alternativo || 'Archivo de la venta';
  const preview = media.tipo === 'video'
    ? `<video src="${escapeHtml(media.url)}" muted playsinline preload="metadata"></video>`
    : `<img src="${escapeHtml(media.url)}" alt="${escapeHtml(alt)}" loading="lazy">`;
  const badge = media.tipo === 'video' ? `${videoIcon}<span>Video</span>` : `${imageIcon}<span>Foto</span>`;
  return `<li class="delivery-media-item"><div class="delivery-media-item__preview">${preview}<span class="delivery-media-item__badge">${badge}</span></div><button class="icon-button" type="button" data-sale-media-remove="${media.id}" aria-label="Eliminar archivo" title="Eliminar archivo">${trashIcon}</button></li>`;
}

export function saleMediaView({ media = [], busy = false, error = '', cleanupPath = '' } = {}) {
  const picker = `<input id="sale-gallery-media-file" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" multiple ${busy ? 'disabled' : ''}>`;
  const gallery = media.length
    ? `<ul class="delivery-media-list">${media.map(mediaPreviewView).join('')}</ul>`
    : '<p class="empty-state">Aún no hay fotos ni videos. Agrega los primeros.</p>';
  return `<section class="delivery-media" aria-label="Fotos y videos de la venta"><header class="delivery-media__header"><div><h3>Fotos y videos</h3><p>${media.length} archivo${media.length === 1 ? '' : 's'} · JPG, PNG, WebP (máx. 5 MiB) y MP4, WebM, MOV (máx. 50 MiB)</p></div><button class="secondary-button" type="button" data-sale-media-select ${busy ? 'disabled' : ''}>${plusIcon}<span>Agregar archivos</span></button></header>${picker}${gallery}${error ? `<p class="message message--error" role="alert">${escapeHtml(error)}</p>` : ''}<p class="image-operation-status" role="status" aria-live="polite">${busy ? 'Actualizando archivos...' : ''}</p>${cleanupPath ? '<div class="delivery-media__actions"><button class="secondary-button" type="button" data-sale-media-cleanup>Reintentar limpieza</button></div>' : ''}</section>`;
}

export function saleGalleryView({ delivery = null, values = {}, error = '', saving = false, sold = false, productName = '', media = [], mediaBusy = false, mediaError = '', cleanupPath = '' } = {}) {
  const record = delivery || {};
  const field = (name) => values[name] ?? record[name] ?? '';
  const heading = `<header class="sale-gallery__heading"><div><h3>Galería de la venta</h3><p>Fotos y videos del vehículo vendido que se publican en la página de inicio.</p></div>${record.id ? `<button class="danger-button" type="button" data-sale-gallery-delete>${trashIcon}<span>Eliminar galería</span></button>` : ''}</header>`;

  if (!sold) {
    return `<section class="sale-gallery" aria-labelledby="sale-gallery-title">${heading.replace('<h3>', '<h3 id="sale-gallery-title">')}<p class="message message--warning" role="status">Cuando marques una presentación como «Vendido», el vehículo saldrá del inventario y del catálogo, y podrás subir aquí las fotos y videos de la venta.</p></section>`;
  }

  const published = field('publicado') === undefined ? true : field('publicado');
  const form = `<form class="delivery-form" id="sale-gallery-form" novalidate><div class="delivery-form__heading"><h2>${record.id ? 'Editar galería' : 'Nueva galería'}</h2><p>Publica las fotos y videos de este vehículo ya vendido.</p></div><label class="field"><span>Título</span><input name="titulo" maxlength="160" value="${escapeHtml(field('titulo') || productName)}" placeholder="Ej. Toyota Hilux 2023 entregada" required></label><label class="field"><span>Descripción <span class="public-optional">Opcional</span></span><textarea name="descripcion" maxlength="500" placeholder="Cuenta brevemente cómo fue la venta y la entrega.">${escapeHtml(field('descripcion'))}</textarea></label><label class="public-legal-acceptance"><input name="publicado" type="checkbox" ${published !== false && published !== 'false' ? 'checked' : ''}><span>Mostrar esta galería en la página de inicio</span></label>${error ? `<p class="message message--error" role="alert">${escapeHtml(error)}</p>` : ''}<div class="delivery-form__actions"><button class="primary-button" type="submit" ${saving ? 'disabled aria-busy="true"' : ''}>${saving ? 'Guardando...' : 'Guardar galería'}</button></div></form>`;

  return `<section class="sale-gallery" aria-labelledby="sale-gallery-title">${heading.replace('<h3>', '<h3 id="sale-gallery-title">')}${form}${saleMediaView({ media, busy: mediaBusy, error: mediaError, cleanupPath })}</section>`;
}