import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { tokenStore } from '../services/tokenStore'
import { clearCart, getCart, removeCartItem, upsertCartItem, type Cart } from '../services/cart'

function money(v: string | number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(v))
}

export function CartPage() {
  const navigate = useNavigate()
  const authed = Boolean(tokenStore.getAccess())

  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const total = useMemo(() => (cart ? money(cart.total) : money(0)), [cart])

  useEffect(() => {
    if (!authed) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getCart()
      .then((res) => {
        if (cancelled) return
        setCart(res)
      })
      .catch(() => {
        if (cancelled) return
        setError('Sepet yüklenemedi.')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [authed])

  if (!authed) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-start gap-3">
          <div className="text-lg font-semibold">Cart</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sepetini görmek için giriş yapmalısın.
          </p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
          <Link
            to="/"
            className="rounded-2xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Continue shopping
          </Link>
        </div>

        {error ? (
          <Card className="p-6">
            <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>
          </Card>
        ) : null}

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-9 w-40" />
                  </div>
                </div>
              </Card>
            ))
          ) : cart && cart.items.length > 0 ? (
            cart.items.map((it) => (
              <Card key={it.productId} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{it.productName}</div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {money(it.unitPrice)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          const next = await upsertCartItem(it.productId, Math.max(1, it.quantity - 1))
                          setCart(next)
                        } catch {
                          toast.error('Güncellenemedi.')
                        }
                      }}
                    >
                      −
                    </Button>
                    <div className="w-10 text-center text-sm">{it.quantity}</div>
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          const next = await upsertCartItem(it.productId, it.quantity + 1)
                          setCart(next)
                        } catch {
                          toast.error('Güncellenemedi.')
                        }
                      }}
                    >
                      +
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:w-48 sm:justify-end">
                    <div className="text-sm font-medium">{money(it.lineTotal)}</div>
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        try {
                          const next = await removeCartItem(it.productId)
                          setCart(next)
                          toast.success('Kaldırıldı.')
                        } catch {
                          toast.error('Kaldırılamadı.')
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Sepetin boş.</div>
            </Card>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-20 p-6">
          <div className="text-lg font-semibold">Order summary</div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-zinc-600 dark:text-zinc-400">Total</div>
            <div className="font-semibold">{total}</div>
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={!cart || cart.items.length === 0 || loading}
            onClick={() => toast.success('Checkout (mock)')}
          >
            Checkout
          </Button>

          <Button
            className="mt-3 w-full"
            variant="secondary"
            disabled={!cart || cart.items.length === 0 || loading}
            onClick={async () => {
              try {
                await clearCart()
                setCart((c) => (c ? { ...c, items: [], total: '0' } : c))
                toast.success('Sepet temizlendi.')
              } catch {
                toast.error('Sepet temizlenemedi.')
              }
            }}
          >
            Clear cart
          </Button>
        </Card>
      </div>
    </div>
  )
}

