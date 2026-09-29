function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function productImageEditorView({ product, image, altText = '', busy = false, error = '', cleanupPath = '' } = {}) {
  if (!product?.id) return `<section class="image-editor image-editor--pending"><h3>Imagen</h3><p>Podrás cargar la imagen después de guardar el producto por primera vez, cuando el sistema tenga su identificador.</p></section>`;

  const alternative = altText || image?.texto_alternativo || product.nombre || '';
  const placeholder = '<p class="image-placeholder" data-image-placeholder><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM7 16l3-3 2 2 3-4 2 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>Imagen no disponible</p>';
  const hiddenPlaceholder = placeholder.replace('data-image-placeholder', 'data-image-placeholder hidden');
  const preview = image
    ? `<img class="product-image-preview" data-image-preview src="${escapeHtml(image.url)}" alt="${escapeHtml(alternative)}">${hiddenPlaceholder}`
    : placeholder;
  const altAction = image ? `<button class="secondary-button" type="button" data-image-alt-save ${busy ? 'disabled' : ''}>Guardar texto alternativo</button>` : '';

  return `<section class="image-editor" aria-labelledby="product-image-title"><h3 id="product-image-title">Imagen</h3><div class="image-editor__preview">${preview}</div><div class="field"><label for="product-image-alt">Texto alternativo</label><input id="product-image-alt" name="texto_alternativo" maxlength="250" value="${escapeHtml(alternative)}" aria-describedby="product-image-help"><p id="product-image-help" class="field-help">Describe la imagen para identificar ${escapeHtml(product.nombre)}.</p></div><div class="field"><label for="product-image-file">${image ? 'Reemplazar imagen' : 'Seleccionar imagen'}</label><input id="product-image-file" type="file" accept="image/jpeg,image/png,image/webp" ${busy ? 'disabled' : ''}><p class="field-help">JPEG, PNG o WebP, hasta 5 MiB.</p></div><p class="message message--error" role="alert">${escapeHtml(error)}</p><p class="image-operation-status" role="status" aria-live="polite">${busy ? 'Procesando imagen...' : ''}</p><div class="image-editor__actions">${altAction}<button class="primary-button" type="button" data-image-upload ${busy ? 'disabled' : ''}>${busy ? 'Procesando...' : image ? 'Reemplazar imagen' : 'Subir imagen'}</button>${image ? `<button class="danger-button" type="button" data-image-remove ${busy ? 'disabled' : ''}>Retirar imagen</button>` : ''}${cleanupPath ? '<button class="secondary-button" type="button" data-image-cleanup>Reintentar limpieza</button>' : ''}</div></section>`;
}
