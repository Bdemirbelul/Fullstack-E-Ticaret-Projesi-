import { Card } from '../ui/Card'
import type { ProductItem } from './data'

type Props = {
  product: ProductItem
  onSelect: (product: ProductItem) => void
}

function money(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value)
}

export function ProductCard({ product, onSelect }: Props) {
  return (
    <button type="button" className="text-left" onClick={() => onSelect(product)}>
      <Card className="group overflow-hidden rounded-2xl border-zinc-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft2 dark:border-zinc-800">
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] w-full bg-gradient-to-br from-zinc-100 to-zinc-50 transition-all duration-300 group-hover:scale-[1.03] dark:from-zinc-900 dark:to-zinc-950" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 to-transparent dark:from-zinc-950/95" />
        </div>
        <div className="space-y-2 p-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            {product.category}
          </div>
          <div className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {product.name}
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">{money(product.price)}</div>
        </div>
      </Card>
    </button>
  )
}

