import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import type { ProductItem, ProductSize } from './data'
import { QuantitySelector } from './QuantitySelector'
import { SizeSelector } from './SizeSelector'

type Props = {
  product: ProductItem | null
  onClose: () => void
}

function money(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value)
}

export function ProductModal({ product, onClose }: Props) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setSelectedSize(null)
    setQuantity(1)
  }, [product?.id])

  const requiresSize = useMemo(() => {
    if (!product) return false
    return product.type !== 'default' && product.availableSizes.length > 0
  }, [product])

  if (!product) return null

  const canAddToCart = !requiresSize || selectedSize !== null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft2 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          onClick={onClose}
          aria-label="Kapat"
        >
          ×
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="aspect-[4/3] w-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                {product.category}
              </div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{product.name}</h3>
              <div className="mt-1 text-lg font-medium text-zinc-800 dark:text-zinc-200">
                {money(product.price)}
              </div>
            </div>

            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {product.description}
            </p>

            {requiresSize ? (
              <SizeSelector
                sizes={product.availableSizes}
                selectedSize={selectedSize}
                onChange={setSelectedSize}
              />
            ) : null}

            <QuantitySelector quantity={quantity} onChange={setQuantity} />

            <Button
              size="lg"
              className="w-full rounded-full"
              disabled={!canAddToCart}
              onClick={() => {
                const sizeText = selectedSize ? ` • Beden: ${selectedSize}` : ''
                toast.success(`${product.name} sepete eklendi (${quantity} adet${sizeText})`)
                onClose()
              }}
            >
              Sepete ekle
            </Button>

            {requiresSize && !selectedSize ? (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Devam etmek için beden seçmelisin.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

