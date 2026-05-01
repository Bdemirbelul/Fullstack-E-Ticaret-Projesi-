import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCategories, listProducts, type Product } from '../../services/products'
import { cn } from '../../utils/cn'

const FALLBACK_MARKET_IMAGE =
  'https://images.openai.com/static-rsc-4/-yLOWxJCVBgHOo9KEBPVOPe0N-MSbqkOrQj4btzvOaDbTIK2iGMtdQlJTRtD-feBzSTm0t_qC6wQ7iCaE2Gy-ziZRvZdG73JP4-Qyu5zjxBulZaKfVa2D1pR0-DbsikTCn4H8Np2J_Ug6ykYWt6_bVH0QR54Z691JtjjvYgvI6oRiLn4pwYENsj8INc6vpuT?purpose=fullsize'

function money(v: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)
}

function getProductImage(product: Product | null): string {
  if (!product) return FALLBACK_MARKET_IMAGE
  if (product.mainImageUrl) return product.mainImageUrl

  const rawImages = (product as Product & { images?: Array<Record<string, unknown>> }).images
  if (Array.isArray(rawImages) && rawImages.length > 0) {
    const first = rawImages[0]
    const imageFromVariants = first?.imageUrl ?? first?.image_url ?? first?.['imageUrl']
    if (typeof imageFromVariants === 'string' && imageFromVariants.trim().length > 0) {
      return imageFromVariants
    }
  }
  return FALLBACK_MARKET_IMAGE
}

function stockText(stock: number | null) {
  if (stock == null) return 'Stok bilgisi yok'
  if (stock <= 0) return 'Stokta yok'
  if (stock <= 5) return `Son ${stock} ürün`
  return `Stok: ${stock}`
}

export function SuperMarketShowcaseSection() {
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMarketIndex, setCurrentMarketIndex] = useState(0)
  const [isMarketHovered, setIsMarketHovered] = useState(false)
  const [heroImageFailed, setHeroImageFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [categories, products] = await Promise.all([listCategories(), listProducts()])
        if (cancelled) return
        const supermarketCategory = categories.find((c) => c.slug === 'super-market')
        const supermarketProducts = products.filter((product) => {
          const productCategoryId = Number(product.category_id ?? product.categoryId)
          return Number(supermarketCategory?.id) === productCategoryId
        })
        setAllProducts(supermarketProducts)
        setCurrentMarketIndex(0)
      } catch {
        if (!cancelled) {
          setAllProducts([])
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

  useEffect(() => {
    if (!allProducts.length || isMarketHovered) return
    const interval = window.setInterval(() => {
      setCurrentMarketIndex((prev) => (prev + 1) % allProducts.length)
    }, 3000)
    return () => window.clearInterval(interval)
  }, [allProducts.length, isMarketHovered])

  const previewProducts = useMemo(() => {
    if (!allProducts.length) return [null, null, null] as Array<Product | null>
    const start = currentMarketIndex % allProducts.length
    return Array.from({ length: 3 }, (_, i) => {
      return allProducts[(start + i) % allProducts.length]
    })
  }, [allProducts, currentMarketIndex])
  const heroImage = heroImageFailed ? FALLBACK_MARKET_IMAGE : '/images/pohotsite.jpg'

  return (
    <section className="-mx-4 overflow-hidden bg-zinc-950 px-4 py-14 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900/90 p-5 shadow-soft2 sm:p-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div
            className="relative"
            onMouseEnter={() => setIsMarketHovered(true)}
            onMouseLeave={() => setIsMarketHovered(false)}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-soft2">
              <img
                src={heroImage}
                alt="Süper market kampanya görseli"
                className={cn(
                  'h-full w-full object-cover object-center transition-all duration-700',
                  loading ? 'opacity-70 blur-[1px]' : 'opacity-100',
                )}
                onError={() => setHeroImageFailed(true)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {previewProducts.map((product, i) => {
                const imageUrl = getProductImage(product)
                return (
                  <button
                    key={product?.id ?? `fallback-${i}`}
                    type="button"
                    className={cn(
                      'w-full max-w-[280px] rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/15',
                      loading ? 'opacity-70' : 'opacity-100',
                    )}
                    onClick={() => {
                      if (!product) {
                        navigate('/products?category=ev-yasam&subcategory=super-market')
                        return
                      }
                      navigate(`/products/${product.id}`)
                    }}
                  >
                    <div className="h-[140px] w-full overflow-hidden rounded-xl bg-zinc-900/50">
                      <img src={imageUrl} alt={product?.name ?? 'Süper market'} className="h-[140px] w-full rounded-xl object-cover" />
                    </div>
                    <div className="mt-3 line-clamp-1 text-base font-semibold text-white">
                      {product?.name ?? 'Süper Market Fırsatları'}
                    </div>
                    <div className="mt-1 text-sm text-white/75">
                      {product ? money(product.finalPrice) : 'Hızlı teslimat fırsatları'}
                    </div>
                    {product ? (
                      <div className="mt-1 text-[11px] text-white/55">{stockText(product.stock)}</div>
                    ) : null}
                  </button>
                )
              })}
            </div>

            {allProducts.length > 1 ? (
              <div className="mt-3 flex justify-center gap-1.5">
                {allProducts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={`Süper market ürün ${i + 1}`}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === currentMarketIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/35',
                    )}
                    onClick={() => setCurrentMarketIndex(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.16em] text-white/85">
              Hızlı teslimat
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              MARKET ÜRÜNLERİ 1 SAATTE KAPINDA
            </h2>
            <p className="max-w-xl text-sm leading-6 text-white/70">
              Günlük ihtiyaçlarını beklemeden tamamla. Süper market ürünlerinde hızlı teslimat ve seçili fırsatları keşfet.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate('/products?category=ev-yasam&subcategory=super-market')}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-medium text-zinc-900 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-soft2"
              >
                Market ürünlerine git
              </button>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/5"
              >
                Sepete git
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
