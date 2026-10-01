import test from 'node:test';
import assert from 'node:assert/strict';
import { addCartItem, emptyCart, getCartCount, getCartTotal, getSelectedCartItems, getSelectedCartTotal, loadCart, revalidateCart, removeCartItem, removeSelectedCartItems, selectedCartIsReady, toggleCartItemSelection, updateCartItemQuantity } from '../src/public-cart.mjs';

const product = { producto_id: 1, nombre: 'Brisa', imagen_url: null };
const available = { id: 2, etiqueta: '100 ml', estado: 'Disponible', precio_normal: 60000, precio_promocional: 50000, maximo_solicitable: 3 };
test('cart combines lines, respects the public requestable limit, calculates totals and removes items', () => { let cart = addCartItem(emptyCart(), product, available, 2); cart = addCartItem(cart, product, available, 2); assert.equal(getCartCount(cart), 3); assert.equal(getCartTotal(cart), 150000); cart = updateCartItemQuantity(cart, 2, 4); assert.equal(cart.items[0].quantity, 3); assert.equal(removeCartItem(cart, 2).items.length, 0); });
test('cart rejects unavailable presentations and malformed storage', () => { assert.equal(addCartItem(emptyCart(), product, { ...available, estado: 'Agotado' }).items.length, 0); assert.deepEqual(loadCart({ getItem: () => '{bad' }), emptyCart()); });
test('cart selects every new line and can exclude products from a request', () => {
  let cart = addCartItem(emptyCart(), product, available, 2);
  assert.equal(getSelectedCartItems(cart).length, 1);
  cart = toggleCartItemSelection(cart, 2);
  assert.equal(getSelectedCartItems(cart).length, 0);
  assert.equal(getSelectedCartTotal(cart), 0);
});
test('removes only selected lines after registration and ignores blocked lines excluded from the request', () => {
  const cart = { version: 2, items: [
    { presentationId: 2, selected: true, quantity: 1, validation: { state: 'valid' } },
    { presentationId: 3, selected: false, quantity: 1, validation: { state: 'blocked' } },
  ] };
  assert.equal(selectedCartIsReady(cart), true);
  assert.deepEqual(removeSelectedCartItems(cart).items.map((item) => item.presentationId), [3]);
});
test('cart revalidation keeps an excessive line visible, updates changes, and blocks continuation', () => {
  const cart = { version: 2, items: [{ presentationId: 2, productId: 1, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, normalPrice: 60000, maxQuantity: 7, quantity: 5 }] };
  const result = revalidateCart(cart, new Map([[1, { ...product, presentaciones: [{ ...available, maximo_solicitable: 3 }] }]]));

  assert.equal(result.ready, false);
  assert.equal(result.cart.items[0].maxQuantity, 3);
  assert.equal(result.cart.items[0].quantity, 5);
  assert.match(result.cart.items[0].validation.message, /Solo hay 3 unidades disponibles/);
});
test('cart revalidation identifies unavailable lines and accepts a current bajo pedido presentation', () => {
  const cart = { version: 2, items: [
    { presentationId: 2, productId: 1, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 },
    { presentationId: 3, productId: 2, name: 'Aura', label: '50 ml', status: 'Disponible', price: 40000, maxQuantity: 2, quantity: 1 },
  ] };
  const result = revalidateCart(cart, new Map([
    [1, { ...product, presentaciones: [{ ...available, estado: 'Bajo pedido', maximo_solicitable: 99 }] }],
    [2, { producto_id: 2, nombre: 'Aura', presentaciones: [{ id: 3, etiqueta: '50 ml', estado: 'Agotado', precio_normal: 40000, maximo_solicitable: 0 }] }],
  ]));

  assert.equal(result.ready, false);
  assert.match(result.cart.items[0].validation.message, /Ahora está disponible bajo pedido/);
  assert.equal(result.cart.items[0].maxQuantity, 99);
  assert.equal(result.cart.items[1].validation.quantityEditable, false);
  assert.match(result.cart.items[1].validation.message, /ya no está disponible/);
});
