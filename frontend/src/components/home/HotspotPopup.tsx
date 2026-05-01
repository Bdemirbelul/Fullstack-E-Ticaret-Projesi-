import { Link } from 'react-router-dom'
import type { Product } from '../../services/products'

type Props = {
  product: Product | null
  top: string
  left: string
  onOpenProduct: (product: Product) => void
}

function money(value: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
}

export function HotspotPopup({ product, top, left, onOpenProduct }: Props) {
  if (!product) return null

  const imageUrl =
    product.mainImageUrl ?? product.images?.find((image) => image.isMain)?.imageUrl ?? product.images?.[0]?.imageUrl ?? null

  return (
    <div
      className="absolute z-30 w-[220px] -translate-x-1/2 -translate-y-full rounded-xl border border-zinc-200 bg-white p-3 shadow-xl transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900"
      style={{ top: `calc(${top} - 10px)`, left }}
    >
      <div className="mb-2 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="h-24 w-full object-cover transition duration-200 hover:scale-[1.03]" />
        ) : (
          <div className="flex h-24 items-center justify-center text-xs text-zinc-500">Görsel yok</div>
        )}
      </div>
      <div className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{product.name}</div>
      <div className="mt-1">
        {product.hasDiscount ? (
          <div className="space-y-0.5">
            <div className="text-xs text-zinc-400 line-through">{money(product.originalPrice)}</div>
            <div className="text-sm font-medium text-rose-600 dark:text-rose-400">{money(product.finalPrice)}</div>
          </div>
        ) : (
          <div className="text-sm font-medium text-rose-600 dark:text-rose-400">{money(product.finalPrice)}</div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenProduct(product)}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Ürüne Git
        </button>
        <Link
          to={`/products/${product.id}`}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-300 px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Detay
        </Link>
      </div>
    </div>
  )
}
