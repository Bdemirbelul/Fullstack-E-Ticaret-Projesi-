import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import heroLuxury from '../../assets/hero-luxury.webp'

export type HeroSlide = {
  badge: string
  title: string
  description: string
  primaryText: string
  secondaryText: string
  image: string
  targetType: 'products' | 'favorites' | 'category'
  targetCategorySlug?: string | null
  targetSubCategorySlug?: string | null
  /** Varsa birincil CTA doğrudan bu path’e gider (ör. süper market filtresi) */
  primaryTo?: string
  secondaryTo: string
}

const heroSlides: HeroSlide[] = [
  {
    badge: 'Yeni sezon • Seçkin seçkiler',
    title: 'LÜKSÜ YENİDEN TANIMLIYORUZ',
    description:
      'Kusursuz oranlar, yalın formlar ve zamansız bir estetik. Sade ama iddialı parçalarla gardırobunu yeniden kurgula.',
    primaryText: 'Şimdi alışveriş',
    secondaryText: 'Favorilerine göz at',
    image: heroLuxury,
    targetType: 'products',
    targetCategorySlug: null,
    targetSubCategorySlug: null,
    secondaryTo: '/favorites',
  },
  {
    badge: 'Hızlı teslimat • Süper market',
    title: 'SİPARİŞİN 1 SAATE KAPINDA',
    description:
      'Süper market ürünlerinde hızlı teslimat fırsatlarını keşfet. Günlük ihtiyaçlarını beklemeden tamamla.',
    primaryText: 'Market ürünlerine git',
    secondaryText: 'Ev & Yaşamı keşfet',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
    targetType: 'category',
    targetCategorySlug: 'ev-yasam',
    targetSubCategorySlug: 'super-market',
    primaryTo: '/products?category=ev-yasam&subcategory=super-market',
    secondaryTo: '/products?category=ev-yasam',
  },
  {
    badge: 'Favoriler • Akıllı takip',
    title: 'FAVORİLERİNE EKLE, İNDİRİMİ KAÇIRMA',
    description: 'Beğendiğin ürünleri favorilerine ekle. İndirim geldiğinde sana haber verelim.',
    primaryText: 'Favorilere göz at',
    secondaryText: 'Ürünleri keşfet',
    image:
      'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1400&q=80',
    targetType: 'favorites',
    secondaryTo: '/products',
  },
  {
    badge: 'Kişisel bakım • Yeni fırsatlar',
    title: 'BAKIM RUTİNİNİ YENİLE',
    description: 'Cilt bakımı, parfüm ve makyaj ürünlerinde seçili fırsatları incele.',
    primaryText: 'Kişisel bakıma git',
    secondaryText: 'Fırsatları keşfet',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80',
    targetType: 'category',
    targetCategorySlug: 'ev-yasam',
    targetSubCategorySlug: 'kisisel-bakim',
    secondaryTo: '/products?category=ev-yasam&subcategory=kisisel-bakim',
  },
]

function primaryHref(slide: HeroSlide): string {
  if (slide.targetType === 'products') return '/products'
  if (slide.targetType === 'favorites') return '/favorites'
  const params = new URLSearchParams()
  if (slide.targetCategorySlug) params.set('category', slide.targetCategorySlug)
  if (slide.targetSubCategorySlug) params.set('subcategory', slide.targetSubCategorySlug)
  const q = params.toString()
  return q ? `/products?${q}` : '/products'
}

const primaryButtonClass =
  'inline-flex h-12 items-center justify-center rounded-2xl bg-zinc-900 px-5 text-base font-medium text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft2 active:translate-y-0 dark:bg-white dark:text-zinc-900'

const secondaryLinkClass =
  'inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-medium text-zinc-700 transition-all duration-300 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'

export function HeroCarousel() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)

  useEffect(() => {
    if (hoverPaused || heroSlides.length <= 1) return
    const interval = window.setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [hoverPaused])

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white px-6 py-12 shadow-sm sm:px-10 sm:py-16 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_10%,rgba(0,0,0,0.08),transparent_55%)] dark:bg-[radial-gradient(800px_circle_at_20%_10%,rgba(255,255,255,0.08),transparent_55%)]" />

      <div className="relative min-h-[280px] sm:min-h-[340px] lg:min-h-[380px]">
        {heroSlides.map((slide, index) => {
          const active = index === currentSlideIndex
          return (
            <div
              key={index}
              className={cn(
                'grid grid-cols-1 items-center gap-10 transition-all duration-500 ease-out lg:grid-cols-2',
                active
                  ? 'relative z-10 translate-x-0 opacity-100'
                  : 'pointer-events-none absolute inset-0 z-0 translate-x-3 opacity-0 lg:translate-x-4',
              )}
              aria-hidden={!active}
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs text-zinc-700 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
                  {slide.badge}
                </div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{slide.title}</h1>
                <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">{slide.description}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link to={slide.primaryTo ?? primaryHref(slide)} className={primaryButtonClass}>
                    {slide.primaryText}
                  </Link>
                  <Link to={slide.secondaryTo} className={secondaryLinkClass}>
                    {slide.secondaryText}
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-soft dark:border-zinc-800">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-500"
                    style={{
                      backgroundImage: `linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.05) 45%, transparent), url(${slide.image})`,
                    }}
                  />
                </div>
                <div className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 rounded-full bg-zinc-900/5 blur-2xl dark:bg-white/10" />
                <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-zinc-900/5 blur-2xl dark:bg-white/10" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative z-20 mt-8 flex justify-center gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Slayt ${index + 1}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentSlideIndex
                ? 'w-8 bg-zinc-900 dark:bg-zinc-100'
                : 'w-2 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500',
            )}
            onClick={() => setCurrentSlideIndex(index)}
          />
        ))}
      </div>
    </section>
  )
}
