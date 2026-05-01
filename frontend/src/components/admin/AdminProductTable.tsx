import type { Product } from '../../services/products'
import { Button } from '../ui/Button'

function money(v: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)
}

function statusOf(stock: number | null) {
  if (stock == null) return { label: 'Stok bilinmiyor', className: 'bg-zinc-100 text-zinc-600' }
  if (stock > 10) return { label: 'Stokta', className: 'bg-emerald-100 text-emerald-700' }
  if (stock > 0) return { label: 'Az Stok', className: 'bg-amber-100 text-amber-700' }
  return { label: 'Stokta Yok', className: 'bg-rose-100 text-rose-700' }
}

type Props = {
  products: Product[]
  onEdit: (product: Product) => void
  onManageImages: (product: Product) => void
  onManageDiscounts: (product: Product) => void
  onDelete: (product: Product) => void
}

export function AdminProductTable({ products, onEdit, onManageImages, onManageDiscounts, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900/60">
          <tr className="text-left text-zinc-600 dark:text-zinc-300">
            <th className="px-3 py-3">Görsel</th>
            <th className="px-3 py-3">Ürün adı</th>
            <th className="px-3 py-3">Kategori</th>
            <th className="px-3 py-3">Fiyat</th>
            <th className="px-3 py-3">İndirim</th>
            <th className="px-3 py-3">İndirimli fiyat</th>
            <th className="px-3 py-3">Stok</th>
            <th className="px-3 py-3">Durum</th>
            <th className="px-3 py-3">Güncellenme</th>
            <th className="px-3 py-3">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const status = statusOf(p.stock)
            return (
              <tr key={p.id} className="border-t border-zinc-200/70 align-top dark:border-zinc-800/70">
                <td className="px-3 py-3">
                  {p.mainImageUrl ? (
                    <img src={p.mainImageUrl} alt={p.name} className="h-12 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
                  )}
                </td>
                <td className="px-3 py-3 font-medium">{p.name}</td>
                <td className="px-3 py-3">{p.categoryName ?? '-'}</td>
                <td className="px-3 py-3">{money(Number(p.originalPrice ?? p.price))}</td>
                <td className="px-3 py-3">{p.hasDiscount ? `%${Number(p.discountPercentage ?? 0).toFixed(2)}` : '-'}</td>
                <td className="px-3 py-3">{money(Number(p.finalPrice ?? p.price))}</td>
                <td className="px-3 py-3">{p.stock ?? '-'}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${status.className}`}>{status.label}</span>
                </td>
                <td className="px-3 py-3">{p.updatedAt ? new Date(p.updatedAt).toLocaleString('tr-TR') : '-'}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(p)}>
                      Düzenle
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onManageImages(p)}>
                      Görseller
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onManageDiscounts(p)}>
                      İndirim Yönet
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(p)}>
                      Sil
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

