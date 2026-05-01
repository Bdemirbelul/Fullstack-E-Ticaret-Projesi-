import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProduct, type Product } from '../../services/products'
import { Hotspot } from './Hotspot'
import { ProductOptionsModal } from '../products/ProductOptionsModal'

type HotspotPoint = {
  productId: number
  label: string
  top: string
  left: string
}

const hotspots: HotspotPoint[] = [
  { productId: 54, label: 'Stand Mikser', top: '42%', left: '73%' },
  { productId: 55, label: 'Paslanmaz Çelik Tencere Seti', top: '43%', left: '40%' },
  { productId: 56, label: 'Siyah Bıçak Seti', top: '31%', left: '10%' },
  { productId: 57, label: 'Çatal Kaşık Bıçak Takımı', top: '76%', left: '20%' },
  { productId: 58, label: 'Limon Desenli Tabak Seti', top: '78%', left: '47%' },
]

export function ShoppableBanner() {
  const [productsById, setProductsById] = useState<Record<number, Product>>({})
  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadProducts() {
      try {
        const entries = await Promise.all(
          hotspots.map(async (spot) => {
            try {
              const product = await getProduct(spot.productId)
              return [spot.productId, product] as const
            } catch {
              return null
            }
          }),
        )
        if (cancelled) return
        const mapped = Object.fromEntries(entries.filter((entry): entry is readonly [number, Product] => entry !== null))
        setProductsById(mapped)
      } catch {
        if (!cancelled) setProductsById({})
      }
    }
    void loadProducts()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!wrapperRef.current) return
      const target = event.target as Node
      if (!wrapperRef.current.contains(target)) {
        setActiveHotspotId(null)
      }
    }

    function onEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveHotspotId(null)
    }

    document.addEventListener('mousedown', onDocumentClick)
    window.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      window.removeEventListener('keydown', onEsc)
    }
  }, [])

  const resolvedProducts = useMemo(() => {
    return hotspots.map((spot) => ({
      ...spot,
      product: productsById[spot.productId] ?? null,
    }))
  }, [productsById])

  return (
    <section className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-[1100px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
          <div
            ref={wrapperRef}
            className="relative h-[300px] w-full overflow-hidden rounded-[24px] border border-zinc-200 bg-[#f5f5f5] md:h-[420px] md:basis-[60%] xl:h-[520px] dark:border-zinc-700 dark:bg-zinc-900"
          >
            <img
              src="/images/banners/mothers-day.png"
              alt="Anneler Günü fırsat banner görseli"
              className="h-full w-full object-contain object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />
            <div className="pointer-events-none absolute left-4 top-4">
              <h3 className="rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-100">
                Anneler Günü Fırsatları
              </h3>
            </div>

            {resolvedProducts.map((spot) => (
              <div key={spot.productId}>
                <Hotspot
                  top={spot.top}
                  left={spot.left}
                  label={spot.label}
                  isActive={activeHotspotId === spot.productId}
                  onClick={() => {
                    setActiveHotspotId(spot.productId)
                    if (spot.product) {
                      setSelectedProduct(spot.product)
                    }
                  }}
                />
              </div>
            ))}
          </div>

          <aside className="flex w-full items-center md:basis-[40%]">
            <div className="max-w-[420px] space-y-5 text-left transition-all duration-500 md:opacity-100">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                ANNELER GÜNÜ ÖZEL
              </div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                Anneleriniz İçin En Güzel Hediyeler
              </h2>
              <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                Seçili ürünlerde Anneler Günü&apos;ne özel indirimleri keşfedin. Sevdiklerinizi mutlu edecek en
                özel ürünler burada.
              </p>
              <Link
                to="/products?category=ev-yasam"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Ürünleri Keşfet
              </Link>
            </div>
          </aside>
        </div>
      </div>
      <ProductOptionsModal
        product={selectedProduct}
        onClose={() => {
          setSelectedProduct(null)
          setActiveHotspotId(null)
        }}
      />
    </section>
  )
}
