type Props = {
  totalProducts: number
  outOfStockCount: number
  discountedCount: number
  categoryCount: number
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  )
}

export function AdminStatsCards({ totalProducts, outOfStockCount, discountedCount, categoryCount }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard title="Toplam Ürün" value={totalProducts} />
      <StatCard title="Stokta Yok" value={outOfStockCount} />
      <StatCard title="İndirimli Ürün" value={discountedCount} />
      <StatCard title="Toplam Kategori" value={categoryCount} />
    </div>
  )
}

