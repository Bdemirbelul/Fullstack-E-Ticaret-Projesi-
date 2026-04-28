import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProduct, type Product } from '../services/products'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { tokenStore } from '../services/tokenStore'
import { upsertCartItem } from '../services/cart'
import { useFavorites } from '../hooks/useFavorites'

export function ProductDetailPage() {
  const { id } = useParams()
  const productId = useMemo(() => Number(id), [id])
  const fav = useFavorites()

  const [p, setP] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!Number.isFinite(productId)) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getProduct(productId)
      .then((res) => {
        if (cancelled) return
        setP(res)
      })
      .catch(() => {
        if (cancelled) return
        setError('Ürün bulunamadı.')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  async function addToCart() {
    if (!p) return
    if (!tokenStore.getAccess()) {
      toast.error('Sepete eklemek için giriş yapmalısın.')
      return
    }
    try {
      await upsertCartItem(p.id, qty)
      toast.success('Sepete eklendi.')
    } catch {
      toast.error('Sepete eklenemedi.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="rounded-2xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          ← Back
        </Link>
      </div>

      {error ? (
        <Card className="p-6">
          <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          {loading ? (
            <Skeleton className="aspect-square w-full rounded-none" />
          ) : (
            <div className="aspect-square w-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />
          )}
        </Card>

        <div className="space-y-5">
          <div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-semibold tracking-tight">{p?.name}</h1>
                <div className="mt-2 text-xl font-medium text-zinc-900 dark:text-zinc-100">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(Number(p?.price ?? 0))}
                </div>
              </>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {p?.description || 'Minimal tasarım, maksimum kalite.'}
            </p>
          )}

          <div className="flex items-center gap-3">
            <div className="w-28">
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <Button className="flex-1" size="lg" onClick={addToCart} disabled={loading}>
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                if (!p) return
                const isFav = fav.has(p.id)
                fav.toggle(p.id)
                toast.success(isFav ? 'Favorilerden çıkarıldı.' : 'Favorilere eklendi.')
              }}
              disabled={loading}
            >
              {p && fav.has(p.id) ? 'Saved' : 'Save'}
            </Button>
          </div>

          {!loading && p ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
              Stock: <span className="font-medium">{p.stock}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

