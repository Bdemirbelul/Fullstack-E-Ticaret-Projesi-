import { cn } from '../../utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900',
        className,
      )}
    />
  )
}

