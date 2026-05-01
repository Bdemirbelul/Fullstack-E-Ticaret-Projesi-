import { api } from './api'
import type { DeliveryDetailsRequest } from './orders'

export type IyzicoCheckoutResponse = {
  orderId: number
  checkoutFormContent?: string | null
  paymentPageUrl?: string | null
  token?: string | null
}

export type IyzicoInitiateResponse = {
  transactionId: number
  orderId: number
  paymentPageUrl?: string | null
  conversationId: string
  checkoutFormContent?: string | null
  token?: string | null
}

const CHECKOUT_PATH = '/api/payments/iyzico/checkout'

/** Ödeme sayfasında dangerouslySetInnerHTML için sessionStorage anahtarı. */
export const IYZICO_CHECKOUT_SESSION_KEY = 'iyzico_checkout_html'

/** Sepeti sunucuya senkronladıktan sonra iyzico ödeme oturumunu başlatır. */
export async function iyzicoCheckoutFromCart(payload: { deliveryDetails: DeliveryDetailsRequest }) {
  const { data } = await api.post<IyzicoCheckoutResponse>(CHECKOUT_PATH, {
    deliveryDetails: payload.deliveryDetails,
  })
  return data
}

export async function initiateIyzicoPayment(payload: {
  orderId: number
  shippingAddress: string
  billingAddress: string
}) {
  const { data } = await api.post<IyzicoInitiateResponse>('/api/payments/iyzico/initiate', payload)
  return data
}
