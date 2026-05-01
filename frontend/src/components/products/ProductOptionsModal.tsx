import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { Product } from '../../services/products'
import { addToLocalCart } from '../../services/localCart'
import { ProductImageGallery } from './ProductImageGallery'
import { ProductOptionSelector } from './ProductOptionSelector'
import { useFavorites } from '../../hooks/useFavorites'

type Props = {
  product: Product | null
  onClose: () => void
}

const SHOE_SIZES = ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45']
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const ACCESSORY_OPTIONS = ['Standart']
const COLOR_OPTIONS = ['Siyah', 'Beyaz', 'Gri', 'Lacivert', 'Bej']

function formatPrice(value: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
}

function categoryType(product: Product) {
  const source = `${product.categorySlug ?? ''} ${product.categoryName ?? ''}`.toLowerCase()
  if (source.includes('ayakk')) return 'shoe'
  if (source.includes('giyim')) return 'clothing'
  if (source.includes('aksesuar')) return 'accessory'
  if (source.includes('elektronik')) return 'electronic'
  if (source.includes('ev')) return 'home'
  return 'default'
}

export function ProductOptionsModal({ product, onClose }: Props) {
  const fav = useFavorites()
  const [quantity, setQuantity] = useState(1)
  const [selectedShoeSize, setSelectedShoeSize] = useState<string>()
  const [selectedSize, setSelectedSize] = useState<string>()
  const [selectedColor, setSelectedColor] = useState<string>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setQuantity(1)
    setSelectedShoeSize(undefined)
    setSelectedSize(undefined)
    setSelectedColor(undefined)
    setError(null)
  }, [product?.id])

  const type = useMemo(() => (product ? categoryType(product) : 'default'), [product])

  if (!product) return null
  const currentProduct = product
  const isFav = fav.has(currentProduct.id)
  const stockValue = typeof currentProduct.stock === 'number' && Number.isFinite(currentProduct.stock) ? currentProduct.stock : null

  const isOutOfStock = stockValue !== null && stockValue <= 0
  const maxQty = Math.max(1, stockValue ?? 1)
  const canUseColor = ['clothing', 'accessory', 'electronic', 'home'].includes(type)
  const imageUrl =
    currentProduct.mainImageUrl ??
    currentProduct.images?.find((item) => item.isMain)?.imageUrl ??
    currentProduct.images?.[0]?.imageUrl ??
    'https://via.placeholder.com/800x600?text=Urun+Gorseli'
  const totalPrice = currentProduct.finalPrice * quantity

  function validate() {
    if (stockValue === null) return 'Stok bilgisi yok.'
    if (isOutOfStock) return 'Bu ürün stokta yok.'
    if (quantity < 1) return 'Adet en az 1 olmalı.'
    if (quantity > stockValue) return 'Seçilen adet stoktan fazla olamaz.'
    if (type === 'shoe' && !selectedShoeSize) return 'Ayakkabı için numara seçmelisiniz.'
    if (type === 'clothing' && !selectedSize) return 'Giyim ürünleri için beden seçmelisiniz.'
    return null
  }

  function onAddToCart() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    addToLocalCart(currentProduct, quantity, { selectedSize, selectedShoeSize, selectedColor }, imageUrl)
    toast.success('Ürün sepete eklendi.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ürün seçenekleri</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              onClick={async () => {
                if (!fav.isAuthed) {
                  toast.error('Favorilere eklemek için giriş yapmalısınız.')
                  return
                }
                try {
                  const added = await fav.toggle(currentProduct.id)
                  toast.success(added ? 'Favorilere eklendi.' : 'Favorilerden çıkarıldı.')
                } catch {
                  toast.error('Favori işlemi sırasında bir hata oluştu.')
                }
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm ring-1 ring-black/5 transition hover:scale-110 hover:bg-zinc-50 dark:bg-zinc-950/60 dark:ring-white/10"
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
            <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Kapat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ProductImageGallery productName={currentProduct.name} mainImageUrl={currentProduct.mainImageUrl} images={currentProduct.images} />

          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">{currentProduct.categoryName ?? 'Kategori'}</div>
              <h4 className="text-2xl font-semibold">{currentProduct.name}</h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{currentProduct.description || 'Açıklama bulunmuyor.'}</p>
              {currentProduct.hasDiscount ? (
                <div className="mt-2 space-y-1">
                  <div className="inline-flex rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
                      %{Math.round(currentProduct.discountPercentage ?? 0)} İndirim
                  </div>
                  <div className="text-sm text-zinc-400 line-through">{formatPrice(currentProduct.originalPrice)}</div>
                  <div className="text-2xl font-semibold text-rose-600 dark:text-rose-400">{formatPrice(currentProduct.finalPrice)}</div>
                </div>
              ) : (
                <div className="mt-2 text-xl font-semibold">{formatPrice(currentProduct.finalPrice)}</div>
              )}
              <div className={`text-sm ${stockValue !== null && stockValue <= 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                  {stockValue === null ? 'Stok bilgisi yok' : stockValue <= 0 ? 'Stokta Yok' : stockValue <= 5 ? `Son ${stockValue} ürün` : `Stok: ${stockValue}`}
              </div>
            </div>

            {type === 'shoe' ? (
                <ProductOptionSelector title="Ayakkabı numarası" options={SHOE_SIZES} selected={selectedShoeSize} onSelect={(value) => { setSelectedShoeSize(value); setError(null) }} required />
            ) : null}
            {type === 'clothing' ? (
                <ProductOptionSelector title="Beden" options={CLOTHING_SIZES} selected={selectedSize} onSelect={(value) => { setSelectedSize(value); setError(null) }} required />
            ) : null}
            {type === 'accessory' ? (
                <ProductOptionSelector title="Seçenek" options={ACCESSORY_OPTIONS} selected={selectedSize} onSelect={(value) => { setSelectedSize(value); setError(null) }} />
            ) : null}

            {canUseColor ? (
              <ProductOptionSelector title="Renk (opsiyonel)" options={COLOR_OPTIONS} selected={selectedColor} onSelect={(value) => { setSelectedColor(value); setError(null) }} />
            ) : null}
            {/* TODO: Product variant/color table eklenince backend’den beslenecek. */}

            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Adet</div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((prev) => Math.max(1, prev - 1))
                    setError(null)
                  }}
                  className="h-9 w-9 rounded-lg border border-zinc-300 dark:border-zinc-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(event) => {
                    const value = Number(event.target.value || 1)
                    setQuantity(Math.min(maxQty, Math.max(1, value)))
                    setError(null)
                  }}
                  className="h-9 w-24 rounded-lg border border-zinc-300 bg-white px-2 text-center dark:border-zinc-700 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((prev) => Math.min(maxQty, prev + 1))
                    setError(null)
                  }}
                  className="h-9 w-9 rounded-lg border border-zinc-300 dark:border-zinc-700"
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-900">
              Toplam: <span className="font-semibold">{formatPrice(totalPrice)}</span>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 flex-1 rounded-xl border border-zinc-300 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                  İptal
              </button>
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isOutOfStock}
                className="h-11 flex-1 rounded-xl bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
