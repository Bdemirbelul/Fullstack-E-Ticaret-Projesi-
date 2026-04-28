import { api } from './api'

export type Product = {
  id: number
  name: string
  description?: string | null
  price: string
  stock: number
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export async function listProducts(page: number, size: number) {
  const { data } = await api.get<Page<Product>>('/products', {
    params: { page, size },
  })
  return data
}

export async function getProduct(id: number) {
  const { data } = await api.get<Product>(`/products/${id}`)
  return data
}

