import { api } from './api'

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
  const { data } = await api.get<Product[]>('/products', { params: query })
  return data
}

export async function getProduct(id: number) {
  const { data } = await api.get<Product>(`/products/${id}`)
  return data
}

export async function listCategories() {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

