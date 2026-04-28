import { cn } from '../../utils/cn'

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm',
        'placeholder:text-zinc-400',
        'focus:outline-none focus:ring-2 focus:ring-zinc-900/10',
        'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-white/10',
        className,
      )}
      {...props}
    />
  )
}

