import type { Product } from '../../services/products'
import toast from 'react-hot-toast'
import { useFavorites } from '../../hooks/useFavorites'

type Props = {
  product: Product
  onOpenOptions: (product: Product) => void
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
}

export function ProductCard({ product, onOpenOptions }: Props) {
  const fav = useFavorites()
  const isFav = fav.has(product.id)
  const stockValue = typeof product.stock === 'number' && Number.isFinite(product.stock) ? product.stock : null

  const imageUrl = product.mainImageUrl ?? product.images?.find((image) => image.isMain)?.imageUrl ?? product.images?.[0]?.imageUrl
  const stockText =
    stockValue === null
      ? 'Stok bilgisi yok'
      : stockValue <= 0
        ? 'Stokta Yok'
        : stockValue <= 5
          ? `Son ${stockValue} ürün`
          : `Stok: ${stockValue}`

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.015] hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">Görsel yok</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-800 backdrop-blur transition group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-900/80 dark:text-zinc-100">
          {product.categoryName ?? 'Kategori'}
        </span>
        <button
          type="button"
          aria-label={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          onClick={async () => {
            if (!fav.isAuthed) {
              toast.error('Favorilere eklemek için giriş yapmalısınız.')
              return
            }
            try {
              const added = await fav.toggle(product.id)
              toast.success(added ? 'Favorilere eklendi.' : 'Favorilerden çıkarıldı.')
            } catch {
              toast.error('Favori işlemi sırasında bir hata oluştu.')
            }
          }}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 p-0.5 shadow-sm ring-1 ring-black/5 transition hover:scale-110 hover:bg-white dark:bg-zinc-950/70 dark:ring-white/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'transparent'} className={isFav ? 'text-rose-600' : 'text-zinc-600 dark:text-zinc-300'}>
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {product.hasDiscount && product.discountPercentage ? (
          <span className="absolute right-3 top-11 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md transition group-hover:scale-105">
            %{Math.round(product.discountPercentage)} İndirim
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <h2 className="line-clamp-1 text-lg font-semibold">{product.name}</h2>
        <p className="line-clamp-2 min-h-10 text-sm text-zinc-600 dark:text-zinc-400">
          {product.description || 'Açıklama bulunmuyor.'}
        </p>
        <div className="flex items-center justify-between">
          <div>
            {product.hasDiscount ? (
              <div className="space-y-0.5">
                <div className="text-xs text-zinc-400 line-through">{formatPrice(product.originalPrice)}</div>
                <div className="text-lg font-semibold text-rose-600 dark:text-rose-400">{formatPrice(product.finalPrice)}</div>
              </div>
            ) : (
              <div className="text-lg font-semibold">{formatPrice(product.finalPrice)}</div>
            )}
            <div className={`text-xs ${stockValue !== null && stockValue <= 0 ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>{stockText}</div>
          </div>
          <button
            type="button"
            onClick={() => onOpenOptions(product)}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </article>
  )
}
