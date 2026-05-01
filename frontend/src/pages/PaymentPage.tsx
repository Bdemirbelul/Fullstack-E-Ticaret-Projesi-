import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { cn } from '../utils/cn'
import { IYZICO_CHECKOUT_SESSION_KEY } from '../services/payments'

export function PaymentPage() {
  const navigate = useNavigate()
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(IYZICO_CHECKOUT_SESSION_KEY)
    if (!raw) {
      navigate('/cart', { replace: true })
      return
    }
    const el = hostRef.current
    if (!el) return

    el.innerHTML = raw
    el.querySelectorAll('script').forEach((oldScript) => {
      const s = document.createElement('script')
      oldScript.getAttributeNames().forEach((name) => {
        s.setAttribute(name, oldScript.getAttribute(name) ?? '')
      })
      s.textContent = oldScript.textContent
      oldScript.replaceWith(s)
    })
    setReady(true)
  }, [navigate])

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Ödeme</h1>
          <Link
            to="/cart"
            className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
            onClick={() => sessionStorage.removeItem(IYZICO_CHECKOUT_SESSION_KEY)}
          >
            Sepete dön
          </Link>
        </div>
        <div
          ref={hostRef}
          className="iyzico-checkout-form min-h-[200px]"
          hidden={!ready}
        />
        {!ready ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Ödeme formu yükleniyor…</p>
        ) : null}
        <div className="mt-6 flex justify-end">
          <Link
            to="/cart"
            onClick={() => sessionStorage.removeItem(IYZICO_CHECKOUT_SESSION_KEY)}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-medium transition',
              'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
            )}
          >
            Vazgeç
          </Link>
        </div>
      </Card>
    </div>
  )
}
