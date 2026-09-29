const CART_KEY = 'esenciales.cart.v1';

function safeQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 99 ? quantity : null;
}

export function emptyCart() { return { version: 1, items: [] }; }

export function loadCart(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem(CART_KEY) || 'null');
    if (!value || value.version !== 1 || !Array.isArray(value.items)) return emptyCart();
    const items = value.items.filter((item) => Number.isInteger(Number(item.presentationId)) && safeQuantity(item.quantity) && Number.isInteger(Number(item.price)) && item.price > 0);
    return { version: 1, items };
  } catch { return emptyCart(); }
}

export function saveCart(cart, storage = globalThis.localStorage) {
  try { storage?.setItem(CART_KEY, JSON.stringify(cart)); return true; } catch { return false; }
}

export function addCartItem(cart, product, presentation) {
  if (!presentation || !['Disponible', 'Bajo pedido'].includes(presentation.estado)) return cart;
  const price = Number(presentation.precio_promocional || presentation.precio_normal);
  if (!Number.isInteger(price) || price <= 0) return cart;
  const presentationId = Number(presentation.id);
  const existing = cart.items.find((item) => item.presentationId === presentationId);
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
    quantity: existing ? Math.min(99, existing.quantity + 1) : 1,
  };
  return { version: 1, items: existing ? cart.items.map((current) => current.presentationId === presentationId ? item : current) : [...cart.items, item] };
}

export function updateCartItemQuantity(cart, presentationId, quantity) {
  const next = safeQuantity(quantity);
  if (!next) return cart;
  return { version: 1, items: cart.items.map((item) => item.presentationId === Number(presentationId) ? { ...item, quantity: next } : item) };
}

export function removeCartItem(cart, presentationId) { return { version: 1, items: cart.items.filter((item) => item.presentationId !== Number(presentationId)) }; }
export function getCartCount(cart) { return cart.items.reduce((total, item) => total + item.quantity, 0); }
export function getCartTotal(cart) { return cart.items.reduce((total, item) => total + item.price * item.quantity, 0); }
