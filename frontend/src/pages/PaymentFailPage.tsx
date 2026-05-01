import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { IYZICO_CHECKOUT_SESSION_KEY } from '../services/payments'
export function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const orderIdParam = searchParams.get('orderId')
  const orderId = useMemo(() => {
    if (!orderIdParam) return null
    const n = Number(orderIdParam)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [orderIdParam])

  useEffect(() => {
    sessionStorage.removeItem(IYZICO_CHECKOUT_SESSION_KEY)
  }, [])

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-semibold">Ödeme Başarısız</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Ödeme tamamlanamadı. Lütfen tekrar deneyin.
          {orderId ? (
            <>
              {' '}
              (Sipariş taslak: <span className="font-mono">#{orderId}</span>)
            </>
          ) : null}
        </p>
        <Link to="/cart">
          <Button className="mt-5" variant="secondary">
            Sepete Dön
          </Button>
        </Link>
      </Card>
    </div>
  )
}
