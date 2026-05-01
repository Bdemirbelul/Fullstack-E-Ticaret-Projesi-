import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProduct, type Product } from '../services/products'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { addToLocalCart } from '../services/localCart'
import { useFavorites } from '../hooks/useFavorites'

type AirpodsColor = {
  name: string
  label: string
  colorCode: string
  image: string
}

const AIRPODS_MAX_ID = 118
const AIRPODS_MAX_COLORS: AirpodsColor[] = [
  { name: 'silver', label: 'Gümüş', colorCode: '#E5E5E0', image: '/images/airpods-max-detail-silver.jpg' },
  { name: 'space-gray', label: 'Uzay Grisi', colorCode: '#3C3C3D', image: '/images/airpods-max-detail-space-gray.jpg' },
  { name: 'sky-blue', label: 'Gök Mavisi', colorCode: '#A8C7DC', image: '/images/airpods-max-detail-sky-blue.jpg' },
  { name: 'pink', label: 'Pembe', colorCode: '#F4B8B8', image: '/images/airpods-max-detail-pink.jpg' },
  { name: 'green', label: 'Yeşil', colorCode: '#C7D6C2', image: '/images/airpods-max-detail-green.jpg' },
]

export function ProductDetailPage() {
  const { id } = useParams()
  const productId = useMemo(() => Number(id), [id])
  const fav = useFavorites()

  const [p, setP] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [selectedColor, setSelectedColor] = useState<AirpodsColor>(AIRPODS_MAX_COLORS[0])
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [zoomPx, setZoomPx] = useState({ x: 0, y: 0 })

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

  const isAirpodsMax = useMemo(() => {
    if (!p) return false
    return p.id === AIRPODS_MAX_ID || p.name.trim().toLowerCase() === 'airpods max'
  }, [p])

  const productImage = useMemo(() => {
    if (!p) return ''
    if (isAirpodsMax) return selectedColor.image
    return (
      p.mainImageUrl ??
      p.images?.find((image) => image.isMain)?.imageUrl ??
      p.images?.[0]?.imageUrl ??
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80'
    )
  }, [p, isAirpodsMax, selectedColor.image])

  async function addToCart() {
    if (!p) return
    try {
      addToLocalCart(
        p,
        qty,
        {
          selectedColor: isAirpodsMax ? selectedColor.label : undefined,
        },
        productImage,
      )
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
            <div
              className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950"
              onMouseEnter={() => {
                if (isAirpodsMax) setIsZooming(true)
              }}
              onMouseLeave={() => {
                setIsZooming(false)
              }}
              onMouseMove={(e) => {
                if (!isAirpodsMax) return
                const rect = e.currentTarget.getBoundingClientRect()
                const rawX = e.clientX - rect.left
                const rawY = e.clientY - rect.top
                const lensHalf = 80
                const clampedX = Math.min(rect.width - lensHalf, Math.max(lensHalf, rawX))
                const clampedY = Math.min(rect.height - lensHalf, Math.max(lensHalf, rawY))
                const x = (clampedX / rect.width) * 100
                const y = (clampedY / rect.height) * 100
                setZoomPos({
                  x: Math.min(100, Math.max(0, x)),
                  y: Math.min(100, Math.max(0, y)),
                })
                setZoomPx({ x: clampedX, y: clampedY })
              }}
            >
              <img
                src={productImage}
                alt={p?.name ?? 'Ürün görseli'}
                className="h-full w-full object-contain transition-all duration-300"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80'
                }}
              />
              {isAirpodsMax && isZooming ? (
                <div
                  className="pointer-events-none absolute hidden h-40 w-40 rounded-xl border border-black/20 bg-white/90 shadow-2xl md:block"
                  style={{
                    left: zoomPx.x - 80,
                    top: zoomPx.y - 80,
                    backgroundImage: `url(${productImage})`,
                    backgroundSize: '220%',
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              ) : null}
            </div>
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

          {!loading && p && isAirpodsMax ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Renk seçimi</div>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                {AIRPODS_MAX_COLORS.map((color) => {
                  const selected = selectedColor.name === color.name
                  return (
                    <button
                      key={color.name}
                      type="button"
                      aria-label={color.label}
                      title={color.label}
                      onClick={() => setSelectedColor(color)}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                        selected
                          ? 'border-zinc-900 ring-2 ring-zinc-900/25 dark:border-white dark:ring-white/30'
                          : 'border-zinc-300 hover:scale-105 dark:border-zinc-600'
                      }`}
                    >
                      <span className="h-6 w-6 rounded-full" style={{ backgroundColor: color.colorCode }} />
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Seçili renk: <span className="font-medium">{selectedColor.label}</span>
              </div>
            </div>
          ) : null}

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
              className="h-11 w-11 rounded-xl px-0"
              aria-label={p && fav.has(p.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              onClick={async () => {
                if (!p) return
                if (!fav.isAuthed) {
                  toast.error('Favorilere eklemek için giriş yapmalısınız.')
                  return
                }
                try {
                  const added = await fav.toggle(p.id)
                  toast.success(added ? 'Favorilere eklendi.' : 'Favorilerden çıkarıldı.')
                } catch {
                  toast.error('Favori işlemi sırasında bir hata oluştu.')
                }
              }}
              disabled={loading}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={p && fav.has(p.id) ? 'currentColor' : 'transparent'}
                className={p && fav.has(p.id) ? 'text-rose-600' : 'text-zinc-600 dark:text-zinc-300'}
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>

          {!loading && p ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
              Stock: <span className="font-medium">{p.stock}</span>
              {isAirpodsMax ? (
                <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                  (Renk: {selectedColor.label})
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

