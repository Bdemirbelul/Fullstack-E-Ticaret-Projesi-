import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { listProducts, type Product } from '../../services/products'

function money(value: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
}

export function ProductGrid() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const apiFiltered = await listProducts({ discounted: true })
        const discounted = apiFiltered.filter((p) => p.hasDiscount)
        if (!cancelled) setItems(discounted)
      } catch {
        try {
          const all = await listProducts()
          if (!cancelled) setItems(all.filter((p) => p.hasDiscount))
        } catch {
          if (!cancelled) setError('İndirimli ürünler yüklenemedi.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const hasItems = useMemo(() => items.length > 0, [items.length])

  function syncArrows() {
    const el = scrollerRef.current
    if (!el) return
    const maxLeft = el.scrollWidth - el.clientWidth - 2
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < maxLeft)
  }

  useEffect(() => {
    syncArrows()
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => syncArrows()
    el.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => syncArrows()
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [items.length, loading])

  function scrollByPage(direction: 'left' | 'right') {
    const el = scrollerRef.current
    if (!el) return
    const amount = Math.max(280, el.clientWidth * 0.85)
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <section id="sezon-arsivi" className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-xs font-medium tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            SEZON FIRSATLARI
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">İNDİRİMDEKİ ÜRÜNLER</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={!canLeft} onClick={() => scrollByPage('left')}>
            ←
          </Button>
          <Button variant="secondary" disabled={!canRight} onClick={() => scrollByPage('right')}>
            →
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
          İndirimli ürünler yükleniyor...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : !hasItems ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
          Şu anda indirimde ürün bulunmuyor.
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-white to-transparent dark:from-zinc-950" />
          <div
            ref={scrollerRef}
            className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-2"
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollBy({ left: e.deltaY, behavior: 'auto' })
              }
            }}
          >
            {items.map((product) => {
              const imageUrl =
                product.mainImageUrl ?? product.images?.find((image) => image.isMain)?.imageUrl ?? product.images?.[0]?.imageUrl
              const stockValue = typeof product.stock === 'number' && Number.isFinite(product.stock) ? product.stock : null
              const isLowStock = stockValue !== null && stockValue > 0 && stockValue <= 5
              return (
                <article
                  key={product.id}
                  className="group w-[280px] flex-none overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">Görsel yok</div>
                    )}
                    {product.discountPercentage ? (
                      <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                        %{Math.round(product.discountPercentage)} İndirim
                      </span>
                    ) : null}
                    {isLowStock ? (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-semibold text-zinc-900">
                        Son {stockValue} ürün
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      {product.categoryName ?? 'Kategori'}
                    </div>
                    <h3 className="line-clamp-1 text-base font-semibold">{product.name}</h3>
                    <div className="space-y-0.5">
                      <div className="text-xs text-zinc-400 line-through">{money(product.originalPrice)}</div>
                      <div className="text-lg font-semibold text-rose-600 dark:text-rose-400">{money(product.finalPrice)}</div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

