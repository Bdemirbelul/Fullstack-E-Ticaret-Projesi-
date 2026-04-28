import { cn } from '../../utils/cn'
import type { ProductSize } from './data'

type Props = {
  sizes: ProductSize[]
  selectedSize: ProductSize | null
  onChange: (size: ProductSize) => void
}

export function SizeSelector({ sizes, selectedSize, onChange }: Props) {
  if (sizes.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
        Beden
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const selected = selectedSize === size
          return (
            <button
              key={String(size)}
              type="button"
              onClick={() => onChange(size)}
              className={cn(
                'min-w-11 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300',
                selected
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-soft dark:border-white dark:bg-white dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900',
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}

