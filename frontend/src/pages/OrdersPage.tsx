import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { listMyOrders, type OrderResponse } from '../services/orders'
import { tokenStore } from '../services/tokenStore'
import { orderStatusDisplay } from '../utils/orderDisplay'
import { cn } from '../utils/cn'

function money(v: number) {
  const n = Number.isFinite(v) ? v : 0
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function OrdersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState<OrderResponse[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = tokenStore.getAccess()
    if (!token) {
      setOrders(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const data = await listMyOrders()
        if (!cancelled) setOrders(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) {
          toast.error('Siparişler yüklenemedi.')
          setOrders([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  if (!tokenStore.getAccess()) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Siparişlerim</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Siparişlerinizi görmek için giriş yapmalısınız.
          </p>
          <Button className="mt-6 w-full" size="lg" onClick={() => navigate('/login')}>
            Giriş yap
          </Button>
          <Link
            to="/products"
            className="mt-4 inline-block text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
          >
            Alışverişe devam et
          </Link>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-sm text-zinc-600 dark:text-zinc-400">Siparişleriniz yükleniyor…</div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Siparişlerim</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Verdiğiniz siparişleri buradan takip edebilirsiniz.
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
        >
          Alışverişe devam et
        </Link>
      </div>

      {!orders?.length ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Henüz siparişiniz yok.</p>
          <Button className="mt-4" onClick={() => navigate('/products')}>
            Ürünlere göz at
          </Button>
        </Card>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const { label, badgeClass } = orderStatusDisplay(o.status)
            const thumbs = o.items.slice(0, 4)
            return (
              <li key={o.id}>
                <Card className="overflow-hidden p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {o.orderNumber || `#${o.id}`}
                        </span>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            badgeClass,
                          )}
                        >
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatDate(o.createdAt)}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {thumbs.map((it) => (
                          <div
                            key={`${o.id}-${it.productId}-${it.productName}`}
                            className="h-11 w-11 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                          >
                            {it.imageUrl ? (
                              <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900" />
                            )}
                          </div>
                        ))}
                        {o.items.length > 4 ? (
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-zinc-300 text-xs font-medium text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
                            +{o.items.length - 4}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                      <div className="text-right">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Toplam</div>
                        <div className="text-lg font-semibold tabular-nums">{money(o.totalPrice)}</div>
                      </div>
                      <Link
                        to={`/orders/${o.id}`}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Detay
                      </Link>
                    </div>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
