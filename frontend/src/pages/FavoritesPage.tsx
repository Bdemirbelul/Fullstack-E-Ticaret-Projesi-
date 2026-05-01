import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useFavorites } from '../hooks/useFavorites'
import type { Product } from '../services/products'
import { ProductCard } from '../components/products/ProductCard'
import { ProductOptionsModal } from '../components/products/ProductOptionsModal'

export function FavoritesPage() {
  const fav = useFavorites()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  const items = useMemo<Product[]>(
    () =>
      fav.items.map((item) => ({
        id: item.productId,
        name: item.name,
        description: item.description ?? null,
        price: item.originalPrice,
        stock: item.stock ?? null,
        categoryId: null,
        categoryName: item.categoryName ?? null,
        categorySlug: null,
        hasDiscount: item.hasDiscount,
        discountPercentage: item.discountPercentage ?? null,
        originalPrice: item.originalPrice,
        discountedPrice: item.hasDiscount ? item.finalPrice : null,
        finalPrice: item.finalPrice,
        mainImageUrl: item.mainImageUrl ?? null,
        images: [],
      })),
    [fav.items],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Favorilerim</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Favori ürünlerini hesabına bağlı olarak görüntülüyorsun.
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={!fav.isAuthed || fav.loading || items.length === 0}
          onClick={() => {
            setConfirmOpen(true)
          }}
        >
          Temizle
        </Button>
      </div>

      {!fav.isAuthed ? (
        <Card className="p-8">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Favorileri görmek için{' '}
            <Link to="/login" className="font-medium text-zinc-900 dark:text-white">
              giriş yapmalısınız
            </Link>
            .
          </div>
        </Card>
      ) : fav.loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <Card key={id} className="overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Henüz favori ürününüz yok.{' '}
            <Link to="/" className="font-medium text-zinc-900 dark:text-white">
              Ürünlere dön
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpenOptions={(product) => {
                setSelectedProduct(product)
              }}
            />
          ))}
        </div>
      )}

      <ProductOptionsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <ConfirmModal
        isOpen={confirmOpen}
        title="Favorileri Temizle"
        description="Tüm favorileriniz silinsin mi?"
        loading={clearing}
        onCancel={() => {
          if (clearing) return
          setConfirmOpen(false)
        }}
        onConfirm={async () => {
          try {
            setClearing(true)
            await fav.clear()
            toast.success('Favoriler temizlendi.')
            setConfirmOpen(false)
          } catch {
            toast.error('Favoriler temizlenirken bir hata oluştu.')
          } finally {
            setClearing(false)
          }
        }}
      />
    </div>
  )
}

