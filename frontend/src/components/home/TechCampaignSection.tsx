import { useEffect, useMemo, useRef, useState } from 'react'
import { listCategories, listProducts, type Product } from '../../services/products'
import { ProductCard } from '../products/ProductCard'
import { ProductOptionsModal } from '../products/ProductOptionsModal'
import type { Category } from '../../services/products'

export function TechCampaignSection() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadElectronicProducts() {
      setLoading(true)
      setError(null)

      try {
        const categories = await listCategories()
        const normalizedCategories = categories.map(normalizeCategory)
        const allowedCategoryIds = getElectronicCategoryIds(normalizedCategories)
        const all = await listProducts()
        if (!cancelled) {
          setItems(filterElectronicByIds(all, allowedCategoryIds))
        }
      } catch {
        if (!cancelled) setError('Elektronik ürünler yüklenemedi.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadElectronicProducts()
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
    const amount = Math.max(280, el.clientWidth * 0.9)
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <section className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[45%,55%]">
          <div className="relative h-[320px] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <img
              src="/images/banners/tech-campaign.png"
              alt="Teknoloji kampanya görseli"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent dark:from-black/70 dark:via-black/35 dark:to-transparent" />
            <div className="absolute inset-y-0 left-0 flex max-w-[85%] flex-col items-start justify-center gap-2 px-8">
              <div className="text-xs font-semibold tracking-[0.18em] text-zinc-800 dark:text-zinc-100">TEKNOLOJİ FIRSATLARI</div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                Elektronik Ürünlerde Kaçmaz Fırsatlar
              </h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-200">Seçili ürünlerde özel indirimler</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                disabled={!canLeft}
                onClick={() => scrollByPage('left')}
                aria-label="Sola kaydır"
              >
                ←
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                disabled={!canRight}
                onClick={() => scrollByPage('right')}
                aria-label="Sağa kaydır"
              >
                →
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                Elektronik ürünler yükleniyor...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : !hasItems ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                Elektronik kategorisinde ürün bulunamadı.
              </div>
            ) : (
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent dark:from-zinc-950" />
                <div
                  ref={scrollerRef}
                  className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2"
                  onWheel={(event) => {
                    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                      event.currentTarget.scrollBy({ left: event.deltaY, behavior: 'auto' })
                    }
                  }}
                >
                  {items.map((product) => (
                    <div key={product.id} className="w-[280px] flex-none sm:w-[310px]">
                      <ProductCard product={product} onOpenOptions={setSelectedProduct} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ProductOptionsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  )
}

function getParentId(category: Category) {
  const parentId = category.parent_id ?? category.parentId ?? (category as { parent?: number | { id?: number } | null }).parent
  if (typeof parentId === 'object' && parentId !== null) {
    return parentId.id !== undefined && parentId.id !== null ? Number(parentId.id) : null
  }
  return parentId === undefined || parentId === null ? null : Number(parentId)
}

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    id: Number(category.id),
    parentId: getParentId(category),
  }
}

function getElectronicCategoryIds(categories: Category[]) {
  const main = categories.find((category) => Number(category.id) === 3)
  if (!main) return [3, 18, 21, 24, 26, 32]

  const children = categories
    .filter((category) => Number(getParentId(category)) === Number(main.id))
    .map((category) => Number(category.id))

  if (children.length > 0) return [Number(main.id), ...children]
  return [Number(main.id), 18, 21, 24, 26, 32]
}

function filterElectronicByIds(products: Product[], allowedCategoryIds: number[]) {
  return products.filter((item) => {
    const categoryId = Number(item.category_id ?? item.categoryId)
    return allowedCategoryIds.includes(categoryId)
  })
}
