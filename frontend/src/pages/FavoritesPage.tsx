import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useFavorites } from '../hooks/useFavorites'
import { getProduct, type Product } from '../services/products'

export function FavoritesPage() {
  const fav = useFavorites()
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all(fav.ids.map((id) => getProduct(id).catch(() => null)))
      .then((res) => {
        if (cancelled) return
        setItems(res.filter(Boolean) as Product[])
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fav.ids])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Kaydettiğin ürünleri burada tutuyoruz (local).
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={fav.ids.length === 0}
          onClick={() => {
            fav.clear()
            toast.success('Temizlendi.')
          }}
        >
          Clear
        </Button>
      </div>

      {fav.ids.length === 0 ? (
        <Card className="p-8">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Favorilerin boş. <Link to="/" className="font-medium text-zinc-900 dark:text-white">Ürünlere dön</Link>.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? fav.ids.map((id) => (
                <Card key={id} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </Card>
              ))
            : items.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />
                  <div className="space-y-3 p-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                          Number(p.price),
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/products/${p.id}`}
                        className="flex-1 rounded-2xl bg-zinc-100 px-3 py-2 text-center text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                      >
                        View
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          fav.remove(p.id)
                          toast.success('Kaldırıldı.')
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      )}
    </div>
  )
}

