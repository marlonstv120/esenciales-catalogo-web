import test from 'node:test';
import assert from 'node:assert/strict';
import { addCartItem, emptyCart, getCartCount, getCartTotal, loadCart, removeCartItem, updateCartItemQuantity } from '../src/public-cart.mjs';

const product = { producto_id: 1, nombre: 'Brisa', imagen_url: null };
const available = { id: 2, etiqueta: '100 ml', estado: 'Disponible', precio_normal: 60000, precio_promocional: 50000 };
test('cart combines lines, clamps quantity, calculates totals and removes items', () => { let cart = addCartItem(emptyCart(), product, available); cart = addCartItem(cart, product, available); assert.equal(getCartCount(cart), 2); assert.equal(getCartTotal(cart), 100000); cart = updateCartItemQuantity(cart, 2, 150); assert.equal(cart.items[0].quantity, 2); assert.equal(removeCartItem(cart, 2).items.length, 0); });
test('cart rejects unavailable presentations and malformed storage', () => { assert.equal(addCartItem(emptyCart(), product, { ...available, estado: 'Agotado' }).items.length, 0); assert.deepEqual(loadCart({ getItem: () => '{bad' }), emptyCart()); });
