type Props = {
  label: string
  icon: string
  imageUrl?: string
  onClick: () => void
}

export function CategoryItemCard({ label, icon, imageUrl, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-xl dark:bg-zinc-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
              const sibling = event.currentTarget.nextElementSibling as HTMLElement | null
              if (sibling) sibling.style.display = 'flex'
            }}
          />
        ) : null}
        <span className={`${imageUrl ? 'hidden' : 'flex'} h-full w-full items-center justify-center`}>{icon}</span>
      </div>
      <div className="text-sm font-medium text-zinc-700 transition group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-zinc-100">
        {label}
      </div>
    </button>
  )
}
