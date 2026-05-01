import { api } from './api'
import type { Product } from './products'

export type AdminImage = {
  id: number
  imageUrl: string
  isMain: boolean
}

export type AdminDiscount = {
  id: number
  discountPercentage: number
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
}

export type AdminProductQuery = {
  categoryId?: number
  search?: string
  sort?: string
  discounted?: boolean
}

export async function listAdminProducts(query?: AdminProductQuery) {
  const { data } = await api.get<Product[]>('/admin/products', { params: query })
  return data
}

export async function createAdminProduct(payload: {
  name: string
  description?: string
  price: number
  stock: number
  categoryId: number
}) {
  const { data } = await api.post<Product>('/admin/products', payload)
  return data
}

export async function updateAdminProduct(
  id: number,
  payload: { name: string; description?: string; price: number; stock: number; categoryId: number },
) {
  const { data } = await api.put<Product>(`/admin/products/${id}`, payload)
  return data
}

export async function deleteAdminProduct(id: number) {
  await api.delete(`/admin/products/${id}`)
}

export async function listAdminProductImages(productId: number) {
  const { data } = await api.get<AdminImage[]>(`/admin/products/${productId}/images`)
  return data
}

export async function addAdminProductImage(productId: number, payload: { imageUrl: string; isMain?: boolean }) {
  const { data } = await api.post<AdminImage[]>(`/admin/products/${productId}/images`, payload)
  return data
}

export async function updateAdminProductImage(
  productId: number,
  imageId: number,
  payload: { imageUrl: string; isMain?: boolean },
) {
  const { data } = await api.put<AdminImage[]>(`/admin/products/${productId}/images/${imageId}`, payload)
  return data
}

export async function deleteAdminProductImage(productId: number, imageId: number) {
  const { data } = await api.delete<AdminImage[]>(`/admin/products/${productId}/images/${imageId}`)
  return data
}

export async function setAdminMainImage(productId: number, imageId: number) {
  const { data } = await api.put<AdminImage[]>(`/admin/products/${productId}/images/${imageId}/main`)
  return data
}

export async function listAdminDiscounts(productId: number) {
  const { data } = await api.get<AdminDiscount[]>(`/admin/products/${productId}/discounts`)
  return data
}

export async function addAdminDiscount(
  productId: number,
  payload: { discountPercentage: number; isActive?: boolean; startDate?: string | null; endDate?: string | null },
) {
  const { data } = await api.post<AdminDiscount[]>(`/admin/products/${productId}/discounts`, payload)
  return data
}

export async function updateAdminDiscount(
  productId: number,
  discountId: number,
  payload: { discountPercentage: number; isActive?: boolean; startDate?: string | null; endDate?: string | null },
) {
  const { data } = await api.put<AdminDiscount[]>(`/admin/products/${productId}/discounts/${discountId}`, payload)
  return data
}

export async function deleteAdminDiscount(productId: number, discountId: number) {
  const { data } = await api.delete<AdminDiscount[]>(`/admin/products/${productId}/discounts/${discountId}`)
  return data
}

export async function toggleAdminDiscount(productId: number, discountId: number) {
  const { data } = await api.patch<AdminDiscount[]>(`/admin/products/${productId}/discounts/${discountId}/toggle`)
  return data
}

