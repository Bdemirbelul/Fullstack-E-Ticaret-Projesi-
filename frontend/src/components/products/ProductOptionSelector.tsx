type Props = {
  title: string
  options: string[]
  selected?: string
  onSelect: (value: string) => void
  required?: boolean
}

export function ProductOptionSelector({ title, options, selected, onSelect, required }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {title} {required ? <span className="text-red-500">*</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-xl border px-3 py-2 text-sm transition ${
              selected === option
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
