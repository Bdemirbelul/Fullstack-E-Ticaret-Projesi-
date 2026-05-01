import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { Category, Product } from '../../services/products'

type SubmitPayload = {
  name: string
  description?: string
  price: number
  stock: number
  categoryId: number
}

type Props = {
  isOpen: boolean
  product: Product | null
  categories: Category[]
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: SubmitPayload) => Promise<void>
}

export function ProductFormModal({ isOpen, product, categories, loading = false, onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setName(product?.name ?? '')
    setDescription(product?.description ?? '')
    setPrice(product?.price != null ? String(product.price) : '')
    setStock(product?.stock != null ? String(product.stock) : '')
    setCategoryId(product?.categoryId != null ? String(product.categoryId) : '')
    setError(null)
  }, [isOpen, product])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedPrice = Number(price)
    const parsedStock = Number(stock)
    const parsedCategoryId = Number(categoryId)

    if (!name.trim()) return setError('Ürün adı boş olamaz.')
    if (!(parsedPrice > 0)) return setError('Fiyat 0’dan büyük olmalı.')
    if (!(parsedStock >= 0)) return setError('Stok negatif olamaz.')
    if (!Number.isFinite(parsedCategoryId) || !parsedCategoryId) return setError('Kategori seçimi zorunlu.')

    setError(null)
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      price: parsedPrice,
      stock: parsedStock,
      categoryId: parsedCategoryId,
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xl font-semibold">{product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <Input placeholder="Ürün adı" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input type="number" min={0.01} step="0.01" placeholder="Fiyat" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input type="number" min={0} step="1" placeholder="Stok" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="">Kategori seçin</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

