import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProduct, type Product } from '../../services/products'
import { Hotspot } from './Hotspot'
import { ProductOptionsModal } from '../products/ProductOptionsModal'

type WatchHotspot = {
  id: number
  productId: number
  label: string
  top: string
  left: string
}

const watchHotspots: WatchHotspot[] = [
  { id: 1, productId: 59, label: 'Klasik Çelik Erkek Saati', top: '38%', left: '18%' },
  { id: 2, productId: 60, label: 'Sportif Chronograph Saat', top: '62%', left: '46%' },
  { id: 3, productId: 61, label: 'Siyah Kadran Diver Saat', top: '58%', left: '75%' },
  { id: 4, productId: 62, label: 'Retro Dijital Çelik Saat', top: '25%', left: '76%' },
  { id: 5, productId: 63, label: 'Premium Gümüş Kol Saati', top: '35%', left: '48%' },
]

export function LuxuryCollectionSection() {
  const [watchProductsById, setWatchProductsById] = useState<Record<number, Product>>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(null)
  const bannerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadWatchProducts() {
      try {
        const entries = await Promise.all(
          watchHotspots.map(async (spot) => {
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
        setWatchProductsById(mapped)
      } catch {
        if (!cancelled) setWatchProductsById({})
      }
    }
    void loadWatchProducts()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!bannerRef.current) return
      const target = event.target as Node
      if (!bannerRef.current.contains(target)) {
        setActiveHotspotId(null)
      }
    }
    function onEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveHotspotId(null)
        setSelectedProduct(null)
      }
    }
    document.addEventListener('mousedown', onDocumentClick)
    window.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      window.removeEventListener('keydown', onEsc)
    }
  }, [])

  const hotspotsWithProducts = useMemo(
    () =>
      watchHotspots.map((spot) => ({
        ...spot,
        product: watchProductsById[spot.productId] ?? null,
      })),
    [watchProductsById],
  )

  return (
    <section className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-[1100px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
          <aside className="flex w-full items-center md:basis-[40%]">
            <div className="max-w-[420px] space-y-5 text-left">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                LÜKS KOLEKSİYON
              </div>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                Zamansız Şıklığın Yeni Adresi
              </h2>
              <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                Seçili saat modellerinde özel indirimleri keşfedin. Tarzınızı tamamlayacak en prestijli koleksiyon
                burada.
              </p>
              <Link
                to="/products?category=aksesuar"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Ürünleri İncele
              </Link>
            </div>
          </aside>

          <div
            ref={bannerRef}
            className="relative h-[420px] w-full overflow-hidden rounded-[24px] border border-zinc-200 md:basis-[60%] dark:border-zinc-700"
          >
            <img
              src="https://wallup.net/wp-content/uploads/2017/11/17/230713-watch-luxury_watches.jpg"
              alt="Lüks saat koleksiyonu banner görseli"
              className="h-full w-full object-cover object-center"
            />
            {hotspotsWithProducts.map((spot) => (
              <Hotspot
                key={spot.id}
                top={spot.top}
                left={spot.left}
                label={spot.label}
                isActive={activeHotspotId === spot.id}
                onClick={() => {
                  setActiveHotspotId(spot.id)
                  if (spot.product) {
                    setSelectedProduct(spot.product)
                  }
                }}
              />
            ))}
          </div>
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
