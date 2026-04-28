type Props = {
  quantity: number
  onChange: (value: number) => void
}

export function QuantitySelector({ quantity, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
        Adet
      </div>
      <div className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          className="h-7 w-7 rounded-full text-lg leading-none text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          onClick={() => onChange(Math.max(1, quantity - 1))}
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-medium">{quantity}</span>
        <button
          type="button"
          className="h-7 w-7 rounded-full text-lg leading-none text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          onClick={() => onChange(quantity + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}

