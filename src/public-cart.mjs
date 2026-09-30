const CART_KEY = 'esenciales.cart.v2';

function safeQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 99 ? quantity : null;
}

function safeMaximum(value) {
  const maximum = Number(value);
  return Number.isInteger(maximum) && maximum >= 1 && maximum <= 99 ? maximum : null;
}

function effectivePrice(presentation) {
  const price = Number(presentation?.precio_promocional || presentation?.precio_normal);
  return Number.isInteger(price) && price > 0 ? price : null;
}

export function emptyCart() { return { version: 2, items: [] }; }

export function loadCart(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem(CART_KEY) || 'null');
    if (!value || value.version !== 2 || !Array.isArray(value.items)) return emptyCart();
    const items = value.items.filter((item) => Number.isInteger(Number(item.presentationId)) && safeQuantity(item.quantity) && safeMaximum(item.maxQuantity) && Number(item.quantity) <= Number(item.maxQuantity) && Number.isInteger(Number(item.price)) && item.price > 0).map((item) => ({ ...item, selected: item.selected !== false }));
    return { version: 2, items };
  } catch { return emptyCart(); }
}

export function saveCart(cart, storage = globalThis.localStorage) {
  try { storage?.setItem(CART_KEY, JSON.stringify(cart)); return true; } catch { return false; }
}

export function addCartItem(cart, product, presentation, quantity = 1) {
  if (!presentation || !['Disponible', 'Bajo pedido'].includes(presentation.estado)) return cart;
  const price = effectivePrice(presentation);
  const maximum = safeMaximum(presentation.maximo_solicitable);
  const requested = safeQuantity(quantity);
  if (!Number.isInteger(price) || price <= 0 || !maximum || !requested) return cart;
  const presentationId = Number(presentation.id);
  const existing = cart.items.find((item) => item.presentationId === presentationId);
  const nextQuantity = existing ? Math.min(maximum, existing.quantity + requested) : Math.min(maximum, requested);
  if (existing && nextQuantity === existing.quantity) return cart;
  const item = {
    presentationId,
    productId: Number(product.producto_id),
    name: product.nombre,
    imageUrl: product.imagen_url || null,
    imageAlt: product.texto_alternativo || product.nombre,
    label: presentation.etiqueta,
    status: presentation.estado,
    price,
    normalPrice: Number(presentation.precio_normal),
    maxQuantity: maximum,
    quantity: nextQuantity,
    selected: true,
  };
  return { version: 2, items: existing ? cart.items.map((current) => current.presentationId === presentationId ? item : current) : [...cart.items, item] };
}

export function updateCartItemQuantity(cart, presentationId, quantity) {
  const next = safeQuantity(quantity);
  const item = cart.items.find((current) => current.presentationId === Number(presentationId));
  if (!next || !item || next > item.maxQuantity || next === item.quantity) return cart;
  return { version: 2, items: cart.items.map((current) => current.presentationId === Number(presentationId) ? { ...item, quantity: next } : current) };
}

export function removeCartItem(cart, presentationId) { return { version: 2, items: cart.items.filter((item) => item.presentationId !== Number(presentationId)) }; }
export function getCartCount(cart) { return cart.items.reduce((total, item) => total + item.quantity, 0); }
export function getCartTotal(cart) { return cart.items.reduce((total, item) => total + item.price * item.quantity, 0); }
export function getSelectedCartItems(cart) { return cart.items.filter((item) => item.selected !== false); }
export function getSelectedCartTotal(cart) { return getSelectedCartItems(cart).reduce((total, item) => total + item.price * item.quantity, 0); }
export function toggleCartItemSelection(cart, presentationId) {
  const item = cart.items.find((current) => current.presentationId === Number(presentationId));
  if (!item) return cart;
  return { version: 2, items: cart.items.map((current) => current.presentationId === item.presentationId ? { ...current, selected: !current.selected } : current) };
}

export function revalidateCart(cart, productsById) {
  const items = cart.items.map((item) => {
    const product = productsById.get(Number(item.productId));
    const presentation = product?.presentaciones?.find((current) => Number(current.id) === Number(item.presentationId));
    if (!presentation) return {
      ...item,
      validation: { state: 'blocked', message: product ? 'Esta presentación ya no está disponible.' : 'Este producto ya no está disponible.', quantityEditable: false },
    };

    const maximum = Number(presentation.maximo_solicitable);
    const requestable = Number.isInteger(maximum) && maximum >= 1 && maximum <= 99;
    const price = effectivePrice(presentation);
    if (!requestable || !price) return {
      ...item,
      name: product.nombre || item.name,
      label: presentation.etiqueta || item.label,
      status: presentation.estado || item.status,
      maxQuantity: 0,
      validation: { state: 'blocked', message: 'Esta presentación ya no está disponible.', quantityEditable: false },
    };

    const messages = [];
    if (presentation.estado !== item.status) messages.push(presentation.estado === 'Bajo pedido' ? 'Ahora está disponible bajo pedido.' : `Ahora está ${presentation.estado === 'Disponible' ? 'en stock' : presentation.estado.toLowerCase()}.`);
    if (price !== item.price) messages.push('El precio se actualizó.');
    if (item.quantity > maximum) messages.push(`Solo hay ${maximum} ${maximum === 1 ? 'unidad disponible' : 'unidades disponibles'}. Tienes ${item.quantity} en el carrito.`);

    return {
      ...item,
      name: product.nombre || item.name,
      label: presentation.etiqueta || item.label,
      status: presentation.estado,
      price,
      normalPrice: Number(presentation.precio_normal),
      maxQuantity: maximum,
      validation: {
        state: item.quantity > maximum ? 'blocked' : messages.length ? 'changed' : 'valid',
        message: messages.join(' '),
        quantityEditable: true,
      },
    };
  });
  return { cart: { version: 2, items }, ready: items.every((item) => item.validation.state !== 'blocked') };
}
