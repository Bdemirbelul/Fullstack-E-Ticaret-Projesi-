import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { clearLocalCart } from '../services/localCart'
import { IYZICO_CHECKOUT_SESSION_KEY } from '../services/payments'

export function PaymentSuccessPage() {
  useEffect(() => {
    clearLocalCart()
    sessionStorage.removeItem(IYZICO_CHECKOUT_SESSION_KEY)
  }, [])

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-semibold">Ödeme Başarılı</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Siparişiniz başarıyla alındı. Hazırlık süreci başladı.</p>
        <Link to="/orders">
          <Button className="mt-5">Siparişlerime Git</Button>
        </Link>
      </Card>
    </div>
  )
}

