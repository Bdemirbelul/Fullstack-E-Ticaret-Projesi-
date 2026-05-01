import axios from 'axios'
import { api } from './api'

export type OrderItemResponse = {
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  /** API JSON: totalPrice (satır tutarı) */
  totalPrice?: number
  lineTotal?: number
  imageUrl?: string | null
}

export function orderItemLineTotal(it: OrderItemResponse): number {
  return Number(it.totalPrice ?? it.lineTotal ?? 0)
}

export type OrderResponse = {
  id: number
  orderNumber: string
  status: string
  paymentStatus: string
  totalPrice: number
  deliveryDetails?: DeliveryDetailsResponse | null
  items: OrderItemResponse[]
  createdAt: string
}

export type DeliveryDetailsRequest = {
  recipientFirstName: string
  recipientLastName: string
  phoneNumber: string
  alternativePhoneNumber?: string
  city: string
  district: string
  neighborhood?: string
  addressLine: string
  buildingNo?: string
  floorNo?: string
  apartmentNo?: string
  postalCode?: string
  deliveryNote?: string
  ifUnreachableLeaveTo?: string
  addressTitle?: string
}

export type DeliveryDetailsResponse = DeliveryDetailsRequest

export type CheckoutRequest = {
  deliveryDetails: DeliveryDetailsRequest
}

function toFiniteNumber(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function formatCreatedAt(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return new Date(v).toISOString()
  if (typeof v === 'object' && v !== null && 'epochSecond' in v) {
    const es = (v as { epochSecond?: number }).epochSecond
    if (typeof es === 'number') return new Date(es * 1000).toISOString()
  }
  return String(v)
}

function absolutizeMediaUrl(url: string | null | undefined): string | null {
  if (url == null || url === '') return null
  if (/^https?:\/\//i.test(url)) return url
  const base = (api.defaults.baseURL ?? '').replace(/\/$/, '')
  if (url.startsWith('/')) return `${base}${url}`
  return `${base}/${url}`
}

function normalizeOrderItem(raw: Record<string, unknown>): OrderItemResponse {
  const imageRaw = raw.imageUrl ?? raw.mainImageUrl
  const imageStr = typeof imageRaw === 'string' && imageRaw.length > 0 ? imageRaw : null
  return {
    productId: toFiniteNumber(raw.productId),
    productName: String(raw.productName ?? ''),
    unitPrice: toFiniteNumber(raw.unitPrice),
    quantity: Math.max(0, Math.floor(toFiniteNumber(raw.quantity))),
    totalPrice: toFiniteNumber(raw.totalPrice ?? raw.lineTotal),
    lineTotal: toFiniteNumber(raw.lineTotal ?? raw.totalPrice),
    imageUrl: absolutizeMediaUrl(imageStr),
  }
}

export function normalizeOrderResponse(raw: unknown): OrderResponse {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 0,
      orderNumber: '',
      status: '',
      paymentStatus: '',
      totalPrice: 0,
      items: [],
      createdAt: '',
    }
  }
  const o = raw as Record<string, unknown>
  const itemsRaw = o.items
  const items: OrderItemResponse[] = Array.isArray(itemsRaw)
    ? itemsRaw.map((it) => normalizeOrderItem(it as Record<string, unknown>))
    : []
  const hasExplicitTotal = o.totalPrice != null || o.total != null
  let totalPrice = toFiniteNumber(o.totalPrice ?? o.total)
  if (!hasExplicitTotal && items.length > 0) {
    totalPrice = items.reduce((acc, it) => acc + orderItemLineTotal(it), 0)
  }
  return {
    id: toFiniteNumber(o.id),
    orderNumber: String(o.orderNumber ?? ''),
    status: String(o.status ?? ''),
    paymentStatus: String(o.paymentStatus ?? ''),
    totalPrice,
    deliveryDetails: normalizeDeliveryDetails(o.deliveryDetails),
    items,
    createdAt: formatCreatedAt(o.createdAt),
  }
}

function normalizeDeliveryDetails(raw: unknown): DeliveryDetailsResponse | null {
  if (!raw || typeof raw !== 'object') return null
  const d = raw as Record<string, unknown>
  return {
    recipientFirstName: String(d.recipientFirstName ?? ''),
    recipientLastName: String(d.recipientLastName ?? ''),
    phoneNumber: String(d.phoneNumber ?? ''),
    alternativePhoneNumber: String(d.alternativePhoneNumber ?? ''),
    city: String(d.city ?? ''),
    district: String(d.district ?? ''),
    neighborhood: String(d.neighborhood ?? ''),
    addressLine: String(d.addressLine ?? ''),
    buildingNo: String(d.buildingNo ?? ''),
    floorNo: String(d.floorNo ?? ''),
    apartmentNo: String(d.apartmentNo ?? ''),
    postalCode: String(d.postalCode ?? ''),
    deliveryNote: String(d.deliveryNote ?? ''),
    ifUnreachableLeaveTo: String(d.ifUnreachableLeaveTo ?? ''),
    addressTitle: String(d.addressTitle ?? ''),
  }
}

/** Yeni API + eski Docker imajları: /api/orders, /orders, sayfalı /orders/my-orders */
export async function createOrder(payload: CheckoutRequest) {
  try {
    const { data } = await api.post<OrderResponse>('/api/orders', payload)
    return normalizeOrderResponse(data)
  } catch (e) {
    if (axios.isAxiosError(e) && (e.response?.status === 404 || e.response?.status === 500)) {
      const { data } = await api.post<OrderResponse>('/orders', payload)
      return normalizeOrderResponse(data)
    }
    throw e
  }
}

export async function listMyOrders(): Promise<OrderResponse[]> {
  const tryArray = async (url: string) => {
    const { data } = await api.get<OrderResponse[] | { content: OrderResponse[] }>(url)
    let list: unknown[] = []
    if (Array.isArray(data)) list = data
    else if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
      list = data.content
    }
    return list.map((row) => normalizeOrderResponse(row))
  }

  try {
    return await tryArray('/api/orders/my')
  } catch (e) {
    if (!axios.isAxiosError(e)) throw e
    const st = e.response?.status
    if (st === 404 || st === 500) {
      try {
        return await tryArray('/orders/my')
      } catch {
        return await tryArray('/orders/my-orders')
      }
    }
    throw e
  }
}

export async function getMyOrder(id: number) {
  try {
    const { data } = await api.get<OrderResponse>(`/api/orders/${id}`)
    return normalizeOrderResponse(data)
  } catch (e) {
    if (axios.isAxiosError(e) && (e.response?.status === 404 || e.response?.status === 500)) {
      const { data } = await api.get<OrderResponse>(`/orders/${id}`)
      return normalizeOrderResponse(data)
    }
    throw e
  }
}

export async function cancelMyOrder(id: number): Promise<OrderResponse> {
  const call = async (method: 'patch' | 'post', url: string) => {
    const { data } = await api.request<OrderResponse>({ method, url })
    return normalizeOrderResponse(data)
  }

  try {
    return await call('patch', `/api/orders/${id}/cancel`)
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const st = e.response?.status
      if (st === 404 || st === 405 || st === 500) {
        try {
          return await call('post', `/api/orders/${id}/cancel`)
        } catch (e2) {
          if (axios.isAxiosError(e2) && (e2.response?.status === 404 || e2.response?.status === 405 || e2.response?.status === 500)) {
            try {
              return await call('patch', `/orders/${id}/cancel`)
            } catch (e3) {
              if (axios.isAxiosError(e3) && (e3.response?.status === 404 || e3.response?.status === 405 || e3.response?.status === 500)) {
                return await call('post', `/orders/${id}/cancel`)
              }
              throw e3
            }
          }
          throw e2
        }
      }
    }
    throw e
  }
}
