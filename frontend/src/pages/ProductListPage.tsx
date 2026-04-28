import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import heroLuxury from '../assets/hero-luxury.webp'
import { ProductGrid } from '../components/product-grid/ProductGrid'

export function ProductListPage() {
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white px-6 py-12 shadow-sm sm:px-10 sm:py-16 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_10%,rgba(0,0,0,0.08),transparent_55%)] dark:bg-[radial-gradient(800px_circle_at_20%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs text-zinc-700 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300">
              Yeni sezon • Seçkin seçkiler
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              LÜKSÜ YENİDEN TANIMLIYORUZ
            </h1>
            <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Kusursuz oranlar, yalın formlar ve zamansız bir estetik. Sade ama iddialı
              parçalarla gardırobunu yeniden kurgula.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" onClick={() => document.getElementById('sezon-arsivi')?.scrollIntoView({ behavior: 'smooth' })}>
                Şimdi alışveriş
              </Button>
              <Link
                to="/favorites"
                className="rounded-2xl px-4 py-3 text-sm font-medium text-zinc-700 transition-all duration-300 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Favorilerine göz at
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-soft dark:border-zinc-800">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.05) 45%, transparent), url(${heroLuxury})`,
                }}
              />
            </div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 rounded-full bg-zinc-900/5 blur-2xl dark:bg-white/10" />
            <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-zinc-900/5 blur-2xl dark:bg-white/10" />
          </div>
        </div>
      </section>

      <ProductGrid />

      {/* DARK SECTION */}
      <section className="-mx-4 overflow-hidden bg-zinc-950 px-4 py-14 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_45%),linear-gradient(225deg,rgba(255,255,255,0.06),transparent_45%)] shadow-soft" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="space-y-5">
            <div className="text-xs font-medium tracking-[0.18em] text-white/60">
              TEKNİK USTALIK
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              TEKNİK HASSASİYETLE ÜRETİLDİ
            </h2>
            <p className="max-w-xl text-sm leading-6 text-white/70">
              Materyal seçimi, dikiş ritmi ve yüzey dokusu; hepsi aynı amaç için: sessiz ama güçlü bir kalite.
              Detaylara yaklaşımımız, tasarımın kendisi kadar iddialı.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/products/1"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-medium text-zinc-900 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-soft2"
              >
                Öne çıkan parçayı incele
              </Link>
              <Link
                to="/cart"
                className="inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/5"
              >
                Sepete git
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

