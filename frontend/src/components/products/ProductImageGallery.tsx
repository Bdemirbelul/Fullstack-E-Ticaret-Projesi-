import { useEffect, useMemo, useState } from 'react'
import type { ProductImage } from '../../services/products'

type Props = {
  productName: string
  mainImageUrl?: string | null
  images?: ProductImage[]
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x600?text=Urun+Gorseli'

export function ProductImageGallery({ productName, mainImageUrl, images = [] }: Props) {
  const ordered = useMemo(() => {
    if (images.length === 0) return []
    return [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain))
  }, [images])

  const fallbackMain = ordered[0]?.imageUrl ?? null
  const initial = mainImageUrl ?? fallbackMain ?? PLACEHOLDER_IMAGE
  const [selectedImage, setSelectedImage] = useState(initial)

  useEffect(() => {
    setSelectedImage(initial)
  }, [initial])

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        <img src={selectedImage} alt={productName} className="aspect-[4/3] w-full object-cover" />
      </div>

      {ordered.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ordered.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(image.imageUrl)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border transition ${
                selectedImage === image.imageUrl
                  ? 'border-zinc-900 ring-2 ring-zinc-300 dark:border-zinc-100 dark:ring-zinc-700'
                  : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500'
              }`}
            >
              <img src={image.imageUrl} alt={`${productName} thumbnail`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
