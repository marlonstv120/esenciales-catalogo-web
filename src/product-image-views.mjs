import { uiIcon } from './ui-icons.mjs';

const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const imageIcon = uiIcon('image');
const videoIcon = uiIcon('video');

function isVideo(image) {
  return image?.tipo === 'video' || /\.(mp4|webm|mov)(\?|#|$)/i.test(image?.url || '');
}

export function productImageEditorView({ product, images = [], image = null, altText = '', altChanged = false, altEditing = false, busy = false, error = '', cleanupPath = '', maxImages = 14 } = {}) {
  if (!product?.id) return `<section class="image-editor image-editor--pending"><h3>Galería</h3><p>Podrás agregar fotografías y videos después de guardar el producto por primera vez.</p></section>`;

  const orderedImages = [...images].sort((a, b) => a.posicion - b.posicion || a.id - b.id);
  const selected = image || orderedImages[0] || null;
  const selectedIndex = orderedImages.findIndex((item) => item.id === selected?.id);
  const cover = orderedImages.find((item) => !isVideo(item)) || null;
  const alternative = altText || selected?.texto_alternativo || product.nombre || '';
  const canAdd = orderedImages.length < maxImages;
  const picker = `<input id="product-image-file" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" multiple ${busy || !canAdd ? 'disabled' : ''}>`;

  const thumbnails = orderedImages.map((item, index) => {
    const active = item.id === selected?.id;
    const video = isVideo(item);
    const media = video
      ? `<video src="${escapeHtml(item.url)}" muted playsinline preload="metadata" aria-hidden="true"></video>`
      : `<img src="${escapeHtml(item.url)}" alt="">`;
    const badge = video ? 'Video' : item.id === cover?.id ? 'Portada' : index + 1;
    return `<li class="image-gallery-item${active ? ' image-gallery-item--active' : ''}"><button type="button" class="image-gallery-item__select" data-image-select-id="${item.id}" aria-label="Editar ${video ? 'video' : 'imagen'} ${index + 1}${!video && item.id === cover?.id ? ', portada' : ''}" aria-pressed="${active}" ${busy ? 'disabled' : ''}>${media}<span>${badge}</span></button></li>`;
  }).join('');

  const gallery = orderedImages.length
    ? `<ol class="image-gallery-list" aria-label="Archivos del producto">${thumbnails}${canAdd ? `<li><button class="image-gallery-add" type="button" data-image-select aria-label="Agregar fotos o videos" ${busy ? 'disabled' : ''}>${uiIcon('plus', { size: 16 })}<span>Agregar</span></button></li>` : ''}</ol>`
    : `<button class="image-gallery-empty" type="button" data-image-select ${busy ? 'disabled' : ''}>${imageIcon}<strong>Agregar fotografías y videos</strong><small>Selecciona hasta ${maxImages} archivos JPG, PNG o WebP, MP4, WebM o MOV · máx. 5 MiB cada uno</small></button>`;

  let detail = '';
  if (selected) {
    const selectedVideo = isVideo(selected);
    const altSection = altEditing
      ? `<section class="image-alt-editor" aria-labelledby="product-image-alt-title"><h4 id="product-image-alt-title">Texto alternativo</h4><label class="field" for="product-image-alt"><span class="visually-hidden">Texto alternativo</span><input id="product-image-alt" name="texto_alternativo" maxlength="250" value="${escapeHtml(selected.texto_alternativo || '')}" aria-describedby="product-image-help"></label><p id="product-image-help">Describe únicamente ${selectedVideo ? 'este video' : 'esta fotografía'}. Si lo dejas vacío, se utilizará «${escapeHtml(product.nombre)}».</p><div class="image-alt-editor__actions"><button class="secondary-button" type="button" data-image-alt-cancel ${busy ? 'disabled' : ''}>Cancelar</button><button class="secondary-button" type="button" data-image-alt-save ${busy || !altChanged ? 'disabled' : ''}>Guardar</button></div></section>`
      : `<section class="image-alt-summary" aria-labelledby="product-image-alt-title"><div><h4 id="product-image-alt-title">Texto alternativo</h4><p>${escapeHtml(alternative)}</p><small>Se usa para describir ${selectedVideo ? 'el video' : 'la imagen'} a personas que no pueden verla.</small></div><button class="secondary-button image-alt-summary__edit" type="button" data-image-alt-edit ${busy ? 'disabled' : ''}>${uiIcon('pencil', { size: 16 })}Editar</button></section>`;
    const preview = selectedVideo
      ? `<video class="product-image-preview" data-image-preview src="${escapeHtml(selected.url)}" controls playsinline preload="metadata" aria-label="${escapeHtml(alternative)}"></video>`
      : `<img class="product-image-preview" data-image-preview src="${escapeHtml(selected.url)}" alt="${escapeHtml(alternative)}">`;
    const coverAction = !selectedVideo && selected.id !== cover?.id ? `<button class="secondary-button" type="button" data-image-primary="${selected.id}" ${busy ? 'disabled' : ''}>Usar como portada</button>` : '';
    detail = `<div class="image-gallery-detail"><div class="image-editor__preview">${preview}<p class="image-placeholder" data-image-placeholder hidden>${selectedVideo ? videoIcon : imageIcon}${selectedVideo ? 'Video no disponible' : 'Imagen no disponible'}</p></div><div class="image-gallery-detail__meta"><strong>${selectedVideo ? 'Video' : 'Imagen'} ${selectedIndex + 1} de ${orderedImages.length}</strong><span>${selectedVideo ? 'Video de la galería' : selected.id === cover?.id ? 'Portada del catálogo' : 'Imagen secundaria'}</span></div><div class="image-editor__image-actions">${coverAction}<button class="danger-button" type="button" data-image-remove ${busy ? 'disabled' : ''}>${uiIcon('trash-2', { size: 16 })}Eliminar</button></div>${altSection}</div>`;
  }

  return `<section class="image-editor" aria-labelledby="product-image-title"><header class="image-editor__header"><div><h3 id="product-image-title">Galería</h3><p>${orderedImages.length} de ${maxImages} archivos · la primera imagen se usa como portada</p></div></header>${picker}${gallery}${detail}${error ? `<p class="message message--error" role="alert">${escapeHtml(error)}</p>` : ''}<p class="image-operation-status" role="status" aria-live="polite">${busy ? 'Actualizando galería...' : ''}</p>${cleanupPath ? '<div class="image-editor__actions"><button class="secondary-button" type="button" data-image-cleanup>Reintentar limpieza</button></div>' : ''}</section>`;
}
