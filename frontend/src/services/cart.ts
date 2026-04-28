import { api } from './api'

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

export async function getCart() {
  const { data } = await api.get<Cart>('/cart')
  return data
}

export async function upsertCartItem(productId: number, quantity: number) {
  const { data } = await api.post<Cart>('/cart/items', { productId, quantity })
  return data
}

export async function removeCartItem(productId: number) {
  const { data } = await api.delete<Cart>(`/cart/items/${productId}`)
  return data
}

export async function clearCart() {
  await api.delete('/cart')
}

