import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { clearLocalCart } from '../services/localCart'
import { IYZICO_CHECKOUT_SESSION_KEY } from '../services/payments'

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderIdParam = searchParams.get('orderId')
  const orderId = useMemo(() => {
    if (!orderIdParam) return null
    const n = Number(orderIdParam)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [orderIdParam])

  useEffect(() => {
    clearLocalCart()
    sessionStorage.removeItem(IYZICO_CHECKOUT_SESSION_KEY)
  }, [])

  const ordersLink = orderId ? `/orders/${orderId}` : '/orders'

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-semibold">Ödeme Başarılı</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Siparişiniz başarıyla alındı.
          {orderId ? (
            <>
              {' '}
              Sipariş numarası: <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">#{orderId}</span>
            </>
          ) : null}
        </p>
        <Link to={ordersLink}>
          <Button className="mt-5">{orderId ? 'Sipariş detayına git' : 'Siparişlerime Git'}</Button>
        </Link>
      </Card>
    </div>
  )
}
