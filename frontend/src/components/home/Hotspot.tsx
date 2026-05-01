type Props = {
  top: string
  left: string
  label: string
  isActive: boolean
  onClick: () => void
}

export function Hotspot({ top, left, label, isActive, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 hover:scale-110 ${
        isActive ? 'scale-110' : ''
      }`}
      style={{ top, left, width: 16, height: 16 }}
      aria-label={label}
    >
      <span className="absolute inset-0 rounded-full bg-rose-500/35 animate-ping" />
      <span className="absolute inset-0 rounded-full border border-white/90 bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.25)] transition group-hover:shadow-[0_0_0_6px_rgba(244,63,94,0.32)]" />
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      <span
        className={`pointer-events-none absolute left-1/2 top-[-12px] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-zinc-200 bg-white/95 px-2 py-1 text-[11px] font-medium text-zinc-800 shadow-md transition-all duration-150 dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-100 ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
