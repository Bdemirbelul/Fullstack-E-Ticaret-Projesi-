import { useMemo, useState } from 'react'
import { Button } from '../ui/Button'
import { ProductCard } from './ProductCard'
import { ProductModal } from './ProductModal'
import { SAMPLE_PRODUCTS, type ProductItem } from './data'

const ITEMS_PER_PAGE = 4

export function ProductGrid() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)

  const maxIndex = Math.max(0, SAMPLE_PRODUCTS.length - ITEMS_PER_PAGE)

  const visibleProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.slice(activeIndex, activeIndex + ITEMS_PER_PAGE)
  }, [activeIndex])

  return (
    <section id="sezon-arsivi" className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-xs font-medium tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            YENİ GELENLER
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">SEZON ARŞİVİ</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            disabled={activeIndex <= 0}
            onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
          >
            ←
          </Button>
          <Button
            variant="secondary"
            disabled={activeIndex >= maxIndex}
            onClick={() => setActiveIndex((prev) => Math.min(maxIndex, prev + 1))}
          >
            →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={(p) => setSelectedProduct(p)}
          />
        ))}
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  )
}

