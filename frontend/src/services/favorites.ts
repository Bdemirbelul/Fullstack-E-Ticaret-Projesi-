import { api } from './api'
import { asArray } from '../utils/safeArray'

export type FavoriteProduct = {
  productId: number
  name: string
  description?: string | null
  originalPrice: number
  finalPrice: number
  hasDiscount: boolean
  discountPercentage?: number | null
  mainImageUrl?: string | null
  categoryName?: string | null
  stock?: number | null
}

export async function listFavorites() {
  const { data } = await api.get<unknown>('/favorites')
  return asArray<FavoriteProduct>(data)
}

export async function addFavorite(productId: number) {
  await api.post(`/favorites/${productId}`)
}

export async function removeFavorite(productId: number) {
  await api.delete(`/favorites/${productId}`)
}

export async function clearFavorites() {
  await api.delete('/favorites')
}

export async function checkFavorite(productId: number) {
  const { data } = await api.get<{ favorite: boolean }>(`/favorites/check/${productId}`)
  return data.favorite
}

