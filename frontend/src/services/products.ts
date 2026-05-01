import { api } from './api'
import { asArray } from '../utils/safeArray'

export type Product = {
  id: number
  name: string
  description?: string | null
  price: number
  stock: number | null
  categoryId?: number | null
  category_id?: number | null
  categoryName?: string | null
  categorySlug?: string | null
  hasDiscount: boolean
  discountPercentage?: number | null
  originalPrice: number
  discountedPrice?: number | null
  finalPrice: number
  mainImageUrl?: string | null
  images?: ProductImage[]
  createdAt?: string
  updatedAt?: string
}

export type ProductImage = {
  id: number
  imageUrl: string
  isMain: boolean
}

export type Category = {
  id: number
  name: string
  slug: string
  description?: string | null
  parentId?: number | null
  parent_id?: number | null
}

export type ProductQuery = {
  categoryId?: number
  category?: string
  search?: string
  sort?: string
  discounted?: boolean
}

export async function listProducts(query?: ProductQuery) {
  const { data } = await api.get<unknown>('/products', { params: query })
  return asArray<Product>(data)
}

export async function getProduct(id: number) {
  const { data } = await api.get<unknown>(`/products/${id}`)
  if (!data || typeof data !== 'object' || data === null) {
    throw new Error('Invalid product response')
  }
  return data as Product
}

export async function listCategories() {
  const { data } = await api.get<unknown>('/categories')
  return asArray<Category>(data)
}

