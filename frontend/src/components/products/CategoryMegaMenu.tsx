import { CategoryItemCard } from './CategoryItemCard'

type SubCategory = {
  id: number
  name: string
  icon: string
  imageUrl?: string
}

type Props = {
  open: boolean
  categoryName: string
  items: SubCategory[]
  onSelectMain: () => void
  onSelectSub: (id: number) => void
}

export function CategoryMegaMenu({ open, categoryName, items, onSelectMain, onSelectSub }: Props) {
  return (
    <div
      className={`absolute left-0 right-0 top-[calc(100%+10px)] z-30 origin-top rounded-2xl border border-zinc-200 bg-white/98 p-5 shadow-2xl backdrop-blur transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950/95 ${
        open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-[0.98] opacity-0'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-xs font-medium tracking-[0.18em] text-zinc-500 dark:text-zinc-400">KATEGORİ</div>
        <button
          type="button"
          onClick={onSelectMain}
          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {categoryName} • Tümü
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <CategoryItemCard
            key={item.id}
            label={item.name}
            icon={item.icon}
            imageUrl={item.imageUrl}
            onClick={() => onSelectSub(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
