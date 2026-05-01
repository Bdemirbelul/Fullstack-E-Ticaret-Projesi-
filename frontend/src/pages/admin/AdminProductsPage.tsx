import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { AdminStatsCards } from '../../components/admin/AdminStatsCards'
import { AdminProductTable } from '../../components/admin/AdminProductTable'
import { ProductFormModal } from '../../components/admin/ProductFormModal'
import { ProductImagesModal } from '../../components/admin/ProductImagesModal'
import { ProductDiscountModal } from '../../components/admin/ProductDiscountModal'
import {
  addAdminDiscount,
  addAdminProductImage,
  deleteAdminDiscount,
  deleteAdminProduct,
  deleteAdminProductImage,
  listAdminDiscounts,
  listAdminProductImages,
  listAdminProducts,
  setAdminMainImage,
  toggleAdminDiscount,
  createAdminProduct,
  updateAdminProduct,
  type AdminDiscount,
  type AdminImage,
} from '../../services/adminProducts'
import { listCategories, type Category, type Product } from '../../services/products'

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
type DiscountFilter = 'all' | 'discounted' | 'non_discounted'

export function AdminProductsPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [imagesOpen, setImagesOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [images, setImages] = useState<AdminImage[]>([])
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([])

  async function refresh() {
    setLoading(true)
    try {
      const [cats, list] = await Promise.all([listCategories(), listAdminProducts()])
      setCategories(cats)
      setProducts(list)
    } catch {
      toast.error('Ürünler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const bySearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
      const byCategory = categoryId === 'all' || String(p.categoryId) === categoryId
      const stock = p.stock ?? 0
      const byStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && stock > 10) ||
        (stockFilter === 'low_stock' && stock > 0 && stock <= 10) ||
        (stockFilter === 'out_of_stock' && stock === 0)
      const byDiscount =
        discountFilter === 'all' ||
        (discountFilter === 'discounted' && p.hasDiscount) ||
        (discountFilter === 'non_discounted' && !p.hasDiscount)

      return bySearch && byCategory && byStock && byDiscount
    })
  }, [products, search, categoryId, stockFilter, discountFilter])

  const stats = useMemo(() => {
    const outOfStockCount = products.filter((p) => (p.stock ?? 0) === 0).length
    const discountedCount = products.filter((p) => p.hasDiscount).length
    const categoryCount = new Set(products.map((p) => p.categoryId).filter(Boolean)).size
    return { outOfStockCount, discountedCount, categoryCount }
  }, [products])

  async function openImages(product: Product) {
    setSelected(product)
    setImagesOpen(true)
    const data = await listAdminProductImages(product.id)
    setImages(data)
  }

  async function openDiscounts(product: Product) {
    setSelected(product)
    setDiscountOpen(true)
    const data = await listAdminDiscounts(product.id)
    setDiscounts(data)
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Ürünleri Yönet</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Ürünleri, stokları, görselleri ve indirimleri buradan yönetin.</p>
          </div>
          <Button
            onClick={() => {
              setSelected(null)
              setFormOpen(true)
            }}
          >
            Yeni Ürün Ekle
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-4">
          <Input placeholder="Ürün ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="all">Tümü</option>
            <option value="in_stock">Stokta Var</option>
            <option value="low_stock">Stok Az</option>
            <option value="out_of_stock">Stokta Yok</option>
          </select>
          <select
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value as DiscountFilter)}
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="all">Tümü</option>
            <option value="discounted">İndirimli</option>
            <option value="non_discounted">İndirimsiz</option>
          </select>
        </div>
      </div>

      <AdminStatsCards
        totalProducts={products.length}
        outOfStockCount={stats.outOfStockCount}
        discountedCount={stats.discountedCount}
        categoryCount={stats.categoryCount}
      />

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950">Ürünler yükleniyor...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950">
          Bu filtrelere uygun ürün bulunamadı.
        </div>
      ) : (
        <AdminProductTable
          products={filteredProducts}
          onEdit={(p) => {
            setSelected(p)
            setFormOpen(true)
          }}
          onManageImages={(p) => void openImages(p)}
          onManageDiscounts={(p) => void openDiscounts(p)}
          onDelete={(p) => {
            setSelected(p)
            setDeleteOpen(true)
          }}
        />
      )}

      <ProductFormModal
        isOpen={formOpen}
        product={selected}
        categories={categories}
        loading={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={async (payload) => {
          setSubmitting(true)
          try {
            if (selected) {
              await updateAdminProduct(selected.id, payload)
              toast.success('Ürün güncellendi.')
            } else {
              await createAdminProduct(payload)
              toast.success('Ürün oluşturuldu.')
            }
            setFormOpen(false)
            await refresh()
          } catch {
            toast.error('Ürün kaydedilemedi.')
          } finally {
            setSubmitting(false)
          }
        }}
      />

      <ProductImagesModal
        isOpen={imagesOpen}
        productName={selected?.name}
        images={images}
        onClose={() => setImagesOpen(false)}
        onAdd={async (imageUrl, isMain) => {
          if (!selected) return
          try {
            const data = await addAdminProductImage(selected.id, { imageUrl, isMain })
            setImages(data)
            toast.success('Görsel eklendi.')
            await refresh()
          } catch {
            toast.error('Görsel eklenemedi.')
          }
        }}
        onDelete={async (imageId) => {
          if (!selected) return
          const data = await deleteAdminProductImage(selected.id, imageId)
          setImages(data)
          toast.success('Görsel silindi.')
          await refresh()
        }}
        onSetMain={async (imageId) => {
          if (!selected) return
          const data = await setAdminMainImage(selected.id, imageId)
          setImages(data)
          toast.success('Ana görsel güncellendi.')
          await refresh()
        }}
      />

      <ProductDiscountModal
        isOpen={discountOpen}
        productName={selected?.name}
        discounts={discounts}
        onClose={() => setDiscountOpen(false)}
        onAdd={async (payload) => {
          if (!selected) return
          try {
            const data = await addAdminDiscount(selected.id, payload)
            setDiscounts(data)
            toast.success('İndirim eklendi.')
            await refresh()
          } catch {
            toast.error('İndirim eklenemedi.')
          }
        }}
        onDelete={async (discountId) => {
          if (!selected) return
          const data = await deleteAdminDiscount(selected.id, discountId)
          setDiscounts(data)
          toast.success('İndirim silindi.')
          await refresh()
        }}
        onToggle={async (discountId) => {
          if (!selected) return
          const data = await toggleAdminDiscount(selected.id, discountId)
          setDiscounts(data)
          toast.success('İndirim durumu güncellendi.')
          await refresh()
        }}
      />

      <ConfirmModal
        isOpen={deleteOpen}
        title="Ürünü Sil"
        description="Bu ürünü silmek istediğinize emin misiniz?"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!selected) return
          try {
            await deleteAdminProduct(selected.id)
            toast.success('Ürün silindi.')
            setDeleteOpen(false)
            await refresh()
          } catch {
            toast.error('Ürün silinemedi.')
          }
        }}
        confirmText="Evet, Sil"
      />
    </div>
  )
}

