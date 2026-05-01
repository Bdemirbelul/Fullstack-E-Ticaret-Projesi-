import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { AdminImage } from '../../services/adminProducts'

type Props = {
  isOpen: boolean
  productName?: string
  images: AdminImage[]
  loading?: boolean
  onClose: () => void
  onAdd: (imageUrl: string, isMain?: boolean) => Promise<void>
  onDelete: (imageId: number) => Promise<void>
  onSetMain: (imageId: number) => Promise<void>
}

export function ProductImagesModal({
  isOpen,
  productName,
  images,
  loading = false,
  onClose,
  onAdd,
  onDelete,
  onSetMain,
}: Props) {
  const [url, setUrl] = useState('')
  const [isMain, setIsMain] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setUrl('')
    setIsMain(false)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xl font-semibold">Görsel Yönetimi - {productName ?? 'Ürün'}</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.length > 0 ? (
            images.map((img) => (
              <div key={img.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <img src={img.imageUrl} alt="Ürün görseli" className="h-28 w-full rounded-lg object-cover" />
                <div className="mt-2 flex items-center justify-between">
                  {img.isMain ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Ana görsel</span>
                  ) : (
                    <button className="text-xs text-zinc-600 underline" onClick={() => onSetMain(img.id)}>
                      Ana görsel yap
                    </button>
                  )}
                  <button className="text-xs text-rose-600 underline" onClick={() => onDelete(img.id)}>
                    Sil
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              Görsel yok, placeholder kullanılacak.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-sm font-medium">Yeni görsel ekle</div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isMain} onChange={(e) => setIsMain(e.target.checked)} />
              Ana görsel
            </label>
            <Button
              onClick={async () => {
                if (!url.trim()) return
                await onAdd(url.trim(), isMain)
                setUrl('')
                setIsMain(false)
              }}
              disabled={loading}
            >
              Ekle
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

