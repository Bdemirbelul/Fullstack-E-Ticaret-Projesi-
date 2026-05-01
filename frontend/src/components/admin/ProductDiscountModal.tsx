import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { AdminDiscount } from '../../services/adminProducts'

type Props = {
  isOpen: boolean
  productName?: string
  discounts: AdminDiscount[]
  loading?: boolean
  onClose: () => void
  onAdd: (payload: { discountPercentage: number; isActive?: boolean; startDate?: string | null; endDate?: string | null }) => Promise<void>
  onDelete: (discountId: number) => Promise<void>
  onToggle: (discountId: number) => Promise<void>
}

export function ProductDiscountModal({ isOpen, productName, discounts, loading = false, onClose, onAdd, onDelete, onToggle }: Props) {
  const [percentage, setPercentage] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setPercentage('')
    setStartDate('')
    setEndDate('')
    setIsActive(true)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xl font-semibold">İndirim Yönetimi - {productName ?? 'Ürün'}</h3>

        <div className="mt-4 space-y-2">
          {discounts.length > 0 ? (
            discounts.map((d) => (
              <div key={d.id} className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                <div className="text-sm">
                  <span className="font-semibold">%{Number(d.discountPercentage).toFixed(2)}</span>{' '}
                  <span className={d.isActive ? 'text-emerald-600' : 'text-zinc-500'}>{d.isActive ? 'Aktif' : 'Pasif'}</span>
                  <div className="text-xs text-zinc-500">
                    {d.startDate ? new Date(d.startDate).toLocaleString('tr-TR') : 'Başlangıç yok'} - {d.endDate ? new Date(d.endDate).toLocaleString('tr-TR') : 'Bitiş yok'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onToggle(d.id)}>
                    Durum Değiştir
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(d.id)}>
                    Sil
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              İndirim kaydı bulunmuyor.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-sm font-medium">Yeni indirim ekle</div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              type="number"
              min={1}
              max={90}
              step="0.01"
              placeholder="İndirim yüzdesi (1-90)"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Aktif
            </label>
            <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              onClick={async () => {
                const val = Number(percentage)
                if (!(val >= 1 && val <= 90)) return
                await onAdd({
                  discountPercentage: val,
                  isActive,
                  startDate: startDate ? new Date(startDate).toISOString() : null,
                  endDate: endDate ? new Date(endDate).toISOString() : null,
                })
                setPercentage('')
                setStartDate('')
                setEndDate('')
                setIsActive(true)
              }}
              disabled={loading}
            >
              İndirim Ekle
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  )
}

