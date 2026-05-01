import { api } from './api'
import { asArray } from '../utils/safeArray'

export type CartItem = {
  productId: number
  productName: string
  unitPrice: string
  quantity: number
  lineTotal: string
}

export type Cart = {
  cartId: number
  items: CartItem[]
  total: string
}

function normalizeCart(raw: unknown): Cart {
  if (!raw || typeof raw !== 'object') {
    return { cartId: 0, items: [], total: '0' }
  }
  const o = raw as Record<string, unknown>
  return {
    cartId: Number(o.cartId ?? 0),
    items: asArray<CartItem>(o.items),
    total: String(o.total ?? '0'),
  }
}

export async function getCart() {
  const { data } = await api.get<unknown>('/cart')
  return normalizeCart(data)
}

export async function upsertCartItem(productId: number, quantity: number) {
  const { data } = await api.post<unknown>('/cart/items', { productId, quantity })
  return normalizeCart(data)
}

export async function removeCartItem(productId: number) {
  const { data } = await api.delete<unknown>(`/cart/items/${productId}`)
  return normalizeCart(data)
}

export async function clearCart() {
  await api.delete('/cart')
}

