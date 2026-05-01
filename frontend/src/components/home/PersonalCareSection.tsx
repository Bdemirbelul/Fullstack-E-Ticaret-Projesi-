import { useCallback, useEffect, useState } from 'react'
import { listCategories, listProducts, type Product } from '../../services/products'
import { ProductOptionsModal } from '../products/ProductOptionsModal'

function formatPrice(value: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
}

export function PersonalCareSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [categories, allProducts] = await Promise.all([listCategories(), listProducts()])
        if (cancelled) return
        const personalCareCategory = categories.find((c) => c.slug === 'kisisel-bakim')
        const list =
          personalCareCategory == null
            ? []
            : allProducts.filter(
                (p) => Number(p.category_id ?? p.categoryId) === Number(personalCareCategory.id),
              )
        setProducts(list)
        setCurrentIndex(0)
      } catch {
        if (!cancelled) setError('Ürünler yüklenemedi.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!products.length || hoverPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [products.length, hoverPaused])

  const current = products[currentIndex] ?? null

  const goPrev = useCallback(() => {
    if (!products.length) return
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }, [products.length])

  const goNext = useCallback(() => {
    if (!products.length) return
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }, [products.length])

  return (
    <section className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-[1100px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
          <aside className="flex w-full items-center md:basis-[40%]">
            <div className="w-full max-w-[420px] space-y-5 text-left">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                KİŞİSEL BAKIM KAMPANYASI
              </div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                Kişisel Bakım Ürünlerinde Akıl Almaz Fırsatlar
              </h2>
              <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                Cilt bakımı, saç bakımı, parfüm ve günlük bakım ürünlerinde özel indirimleri keşfet.
              </p>

              <div
                className="w-full"
                onMouseEnter={() => setHoverPaused(true)}
                onMouseLeave={() => setHoverPaused(false)}
              >
                {loading ? (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                    Ürünler yükleniyor...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                  </div>
                ) : !current ? (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                    Bu kategoride henüz ürün yok.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        onClick={goPrev}
                        disabled={products.length <= 1}
                        aria-label="Önceki ürün"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        onClick={goNext}
                        disabled={products.length <= 1}
                        aria-label="Sonraki ürün"
                      >
                        →
                      </button>
                    </div>

                    <article
                      key={current.id}
                      className="flex gap-3 rounded-xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 to-white p-3 shadow-sm transition-opacity duration-300 dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-950"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                        {current.mainImageUrl ? (
                          <img
                            src={current.mainImageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-500">
                            Görsel yok
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                            {current.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-baseline gap-2">
                            {current.hasDiscount && current.originalPrice > current.finalPrice ? (
                              <>
                                <span className="text-xs text-zinc-400 line-through dark:text-zinc-500">
                                  {formatPrice(current.originalPrice)}
                                </span>
                                <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                                  {formatPrice(current.finalPrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {formatPrice(current.finalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-zinc-900 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:w-auto sm:px-4"
                          onClick={() => setModalProduct(current)}
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    </article>

                    {products.length > 1 ? (
                      <div className="flex justify-center gap-1.5 pt-1">
                        {products.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Ürün ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all ${
                              i === currentIndex
                                ? 'w-6 bg-zinc-900 dark:bg-zinc-100'
                                : 'w-1.5 bg-zinc-300 dark:bg-zinc-600'
                            }`}
                            onClick={() => setCurrentIndex(i)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="relative h-[360px] w-full overflow-hidden rounded-[24px] border border-zinc-200 md:h-[420px] md:basis-[60%] dark:border-zinc-700">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80"
              alt="Kişisel bakım kampanya görseli"
              className="h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
          </div>
        </div>
      </div>
      <ProductOptionsModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </section>
  )
}
