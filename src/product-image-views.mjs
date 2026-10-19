const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const icon = (paths) => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const imageIcon = icon('<path d="M4 5h16v14H4zM7 16l3-3 2 2 3-4 2 5"/>');

export function productImageEditorView({ product, images = [], image = null, altText = '', altChanged = false, altEditing = false, busy = false, error = '', cleanupPath = '', maxImages = 6 } = {}) {
  if (!product?.id) return `<section class="image-editor image-editor--pending"><h3>Galería</h3><p>Podrás agregar fotografías después de guardar el producto por primera vez.</p></section>`;

  const orderedImages = [...images].sort((a, b) => a.posicion - b.posicion || a.id - b.id);
  const selected = image || orderedImages[0] || null;
  const selectedIndex = orderedImages.findIndex((item) => item.id === selected?.id);
  const alternative = altText || selected?.texto_alternativo || product.nombre || '';
  const canAdd = orderedImages.length < maxImages;
  const picker = `<input id="product-image-file" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple ${busy || !canAdd ? 'disabled' : ''}>`;

  const thumbnails = orderedImages.map((item, index) => {
    const active = item.id === selected?.id;
    return `<li class="image-gallery-item${active ? ' image-gallery-item--active' : ''}"><button type="button" class="image-gallery-item__select" data-image-select-id="${item.id}" aria-label="Editar imagen ${index + 1}${index === 0 ? ', portada' : ''}" aria-pressed="${active}" ${busy ? 'disabled' : ''}><img src="${escapeHtml(item.url)}" alt=""><span>${index === 0 ? 'Portada' : index + 1}</span></button></li>`;
  }).join('');

  const gallery = orderedImages.length
    ? `<ol class="image-gallery-list" aria-label="Imágenes del producto">${thumbnails}${canAdd ? `<li><button class="image-gallery-add" type="button" data-image-select aria-label="Agregar más imágenes" ${busy ? 'disabled' : ''}>${icon('<path d="M12 5v14M5 12h14"/>')}<span>Agregar</span></button></li>` : ''}</ol>`
    : `<button class="image-gallery-empty" type="button" data-image-select ${busy ? 'disabled' : ''}>${imageIcon}<strong>Agregar fotografías</strong><small>Selecciona hasta ${maxImages} archivos JPG, PNG o WebP · máx. 5 MiB cada uno</small></button>`;

  let detail = '';
  if (selected) {
    const altSection = altEditing
      ? `<section class="image-alt-editor" aria-labelledby="product-image-alt-title"><h4 id="product-image-alt-title">Texto alternativo</h4><label class="field" for="product-image-alt"><span class="visually-hidden">Texto alternativo</span><input id="product-image-alt" name="texto_alternativo" maxlength="250" value="${escapeHtml(selected.texto_alternativo || '')}" aria-describedby="product-image-help"></label><p id="product-image-help">Describe únicamente esta fotografía. Si lo dejas vacío, se utilizará «${escapeHtml(product.nombre)}».</p><div class="image-alt-editor__actions"><button class="secondary-button" type="button" data-image-alt-cancel ${busy ? 'disabled' : ''}>Cancelar</button><button class="secondary-button" type="button" data-image-alt-save ${busy || !altChanged ? 'disabled' : ''}>Guardar</button></div></section>`
      : `<section class="image-alt-summary" aria-labelledby="product-image-alt-title"><div><h4 id="product-image-alt-title">Texto alternativo</h4><p>${escapeHtml(alternative)}</p><small>Se usa para describir la imagen a personas que no pueden verla.</small></div><button class="secondary-button image-alt-summary__edit" type="button" data-image-alt-edit ${busy ? 'disabled' : ''}>${icon('<path d="m4 20 4-1 10-10-3-3L5 16l-1 4Z"/><path d="m13 7 3 3"/>')}Editar</button></section>`;
    detail = `<div class="image-gallery-detail"><div class="image-editor__preview"><img class="product-image-preview" data-image-preview src="${escapeHtml(selected.url)}" alt="${escapeHtml(alternative)}"><p class="image-placeholder" data-image-placeholder hidden>${imageIcon}Imagen no disponible</p></div><div class="image-gallery-detail__meta"><strong>Imagen ${selectedIndex + 1} de ${orderedImages.length}</strong><span>${selectedIndex === 0 ? 'Portada del catálogo' : 'Imagen secundaria'}</span></div><div class="image-editor__image-actions">${selectedIndex > 0 ? `<button class="secondary-button" type="button" data-image-primary="${selected.id}" ${busy ? 'disabled' : ''}>Usar como portada</button>` : ''}<button class="danger-button" type="button" data-image-remove ${busy ? 'disabled' : ''}>${icon('<path d="M4 7h16M10 11v6M14 11v6M9 7l1-2h4l1 2M8 7l1 13h6l1-13"/>')}Eliminar</button></div>${altSection}</div>`;
  }

  return `<section class="image-editor" aria-labelledby="product-image-title"><header class="image-editor__header"><div><h3 id="product-image-title">Galería</h3><p>${orderedImages.length} de ${maxImages} imágenes · la primera se usa como portada</p></div></header>${picker}${gallery}${detail}${error ? `<p class="message message--error" role="alert">${escapeHtml(error)}</p>` : ''}<p class="image-operation-status" role="status" aria-live="polite">${busy ? 'Actualizando galería...' : ''}</p>${cleanupPath ? '<div class="image-editor__actions"><button class="secondary-button" type="button" data-image-cleanup>Reintentar limpieza</button></div>' : ''}</section>`;
}
