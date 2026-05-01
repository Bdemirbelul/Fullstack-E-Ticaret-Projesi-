import { api } from './api'

export type AdminOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'CREATED'

export type AdminPaymentStatus = 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'REFUNDED'

export type AdminOrderItem = {
  productId: number
  productName: string
  categoryName?: string | null
  imageUrl?: string | null
  quantity: number
  unitPrice: number
  finalPrice: number
  totalPrice: number
  selectedSize?: string | null
  selectedShoeSize?: string | null
  selectedColor?: string | null
}

export type AdminOrder = {
  id: number
  orderNumber: string
  userId: number
  customerName: string
  customerEmail: string
  status: AdminOrderStatus
  statusLabel: string
  paymentStatus: AdminPaymentStatus
  totalAmount: number
  subtotal: number
  discountTotal: number
  shippingFee: number
  itemCount: number
  createdAt: string
  updatedAt: string
  items: AdminOrderItem[]
}

export async function listAdminOrders(params?: {
  search?: string
  status?: AdminOrderStatus
  paymentStatus?: AdminPaymentStatus
  from?: string
  to?: string
}) {
  const { data } = await api.get<AdminOrder[]>('/api/admin/orders', { params })
  return data
}

export async function getAdminOrder(id: number) {
  const { data } = await api.get<AdminOrder>(`/api/admin/orders/${id}`)
  return data
}

export async function updateAdminOrderStatus(id: number, status: AdminOrderStatus) {
  const { data } = await api.patch<AdminOrder>(`/api/admin/orders/${id}/status`, { status })
  return data
}

export async function cancelAdminOrder(id: number) {
  await api.patch(`/api/admin/orders/${id}/cancel`)
}

