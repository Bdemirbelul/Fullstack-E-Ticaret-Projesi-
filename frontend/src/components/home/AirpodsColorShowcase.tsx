import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProduct, type Product } from '../../services/products'
import { addToLocalCart } from '../../services/localCart'
import { cn } from '../../utils/cn'

type AirpodsColor = {
  name: string
  label: string
  colorCode: string
  image: string
}

const airpodsColors: AirpodsColor[] = [
  {
    name: 'Silver',
    label: 'Gümüş',
    colorCode: '#E5E5E0',
    image: '/images/airpods-max-default-silver.jpg',
  },
  {
    name: 'Space Gray',
    label: 'Uzay Grisi',
    colorCode: '#3C3C3D',
    image: '/images/airpods-max-default-space-gray.jpg',
  },
  {
    name: 'Sky Blue',
    label: 'Gök Mavisi',
    colorCode: '#A8C7DC',
    image: '/images/airpods-max-default-sky-blue.jpg',
  },
  {
    name: 'Pink',
    label: 'Pembe',
    colorCode: '#F4B8B8',
    image: '/images/airpods-max-default-pink.jpg',
  },
  {
    name: 'Green',
    label: 'Yeşil',
    colorCode: '#C7D6C2',
    image: '/images/airpods-max-default-green.jpg',
  },
]
const AIRPODS_MAX_PRODUCT_ID = 118

function money(v: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)
}

export function AirpodsColorShowcase() {
  const navigate = useNavigate()
  const [selectedAirpodsColor, setSelectedAirpodsColor] = useState<AirpodsColor>(airpodsColors[0])
  const [airpodsProduct, setAirpodsProduct] = useState<Product | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadAirpods() {
      try {
        const product = await getProduct(AIRPODS_MAX_PRODUCT_ID)
        if (!cancelled) setAirpodsProduct(product)
      } catch {
        if (!cancelled) setAirpodsProduct(null)
      }
    }
    void loadAirpods()
    return () => {
      cancelled = true
    }
  }, [])

  const displayPrice = useMemo(() => {
    if (!airpodsProduct) return null
    return money(airpodsProduct.finalPrice)
  }, [airpodsProduct])

  const selectedImage = selectedAirpodsColor.image

  return (
    <section className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <img
              key={selectedAirpodsColor.name}
              src={selectedImage}
              alt={`AirPods Max ${selectedAirpodsColor.label}`}
              className="h-[320px] w-full rounded-2xl object-contain transition-all duration-500 ease-out sm:h-[420px]"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80'
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/5 to-transparent dark:from-zinc-100/5" />
          </div>

          <div className="space-y-5">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">İstediğin Renkle Senin Olsun</h2>
            <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              AirPods Max&apos;i tarzına en uygun renkle seç. Renge dokun, görünüm anında değişsin.
            </p>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">AirPods Max</div>
              <div className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {displayPrice ?? 'Fiyat yükleniyor...'}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                {airpodsColors.map((color) => {
                  const selected = selectedAirpodsColor.name === color.name
                  return (
                    <button
                      key={color.name}
                      type="button"
                      aria-label={color.label}
                      title={color.label}
                      onClick={() => {
                        setSelectedAirpodsColor(color)
                      }}
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-full border transition',
                        selected
                          ? 'border-zinc-900 ring-2 ring-zinc-900/25 dark:border-white dark:ring-white/30'
                          : 'border-zinc-300 hover:scale-105 dark:border-zinc-600',
                      )}
                    >
                      <span className="h-6 w-6 rounded-full" style={{ backgroundColor: color.colorCode }} />
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                Seçili renk: <span className="font-medium">{selectedAirpodsColor.label}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                onClick={() => {
                  if (airpodsProduct?.id === AIRPODS_MAX_PRODUCT_ID) {
                    addToLocalCart(
                      airpodsProduct,
                      1,
                      { selectedColor: selectedAirpodsColor.label },
                      selectedAirpodsColor.image,
                    )
                    toast.success('AirPods Max sepete eklendi.')
                    return
                  }
                  navigate(`/products/${AIRPODS_MAX_PRODUCT_ID}`)
                }}
              >
                Sepete Ekle
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-300 px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                onClick={() => {
                  navigate(`/products/${AIRPODS_MAX_PRODUCT_ID}`)
                }}
              >
                Ürünü İncele
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

