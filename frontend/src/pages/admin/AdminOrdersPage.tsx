import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import {
  cancelAdminOrder,
  getAdminOrder,
  listAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from '../../services/adminOrders'

const MONEY = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })

const STATUS_OPTIONS: AdminOrderStatus[] = [
  'PREPARING',
  'SHIPPED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

function statusLabel(s: AdminOrderStatus) {
  switch (s) {
    case 'PENDING_PAYMENT':
      return 'Odeme Bekliyor'
    case 'PAID':
      return 'Odendi'
    case 'PREPARING':
      return 'Hazirlaniyor'
    case 'SHIPPED':
      return 'Kargoya Verildi'
    case 'IN_TRANSIT':
      return 'Kargoda'
    case 'DELIVERED':
      return 'Teslim Edildi'
    case 'CANCELLED':
      return 'Iptal Edildi'
    case 'REFUNDED':
      return 'Iade Edildi'
    default:
      return 'Olusturuldu'
  }
}

const TIMELINE: AdminOrderStatus[] = ['CREATED', 'PAID', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED']

export function AdminOrdersPage() {
  const [items, setItems] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [paymentStatus, setPaymentStatus] = useState<string>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [detail, setDetail] = useState<AdminOrder | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<AdminOrder | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const data = await listAdminOrders({
        search: search || undefined,
        status: status !== 'all' ? (status as AdminOrderStatus) : undefined,
        paymentStatus: paymentStatus !== 'all' ? (paymentStatus as AdminPaymentStatus) : undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
      })
      setItems(data)
    } catch {
      toast.error('Siparişler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todays = items.filter((o) => new Date(o.createdAt).toDateString() === today).length
    const preparing = items.filter((o) => o.status === 'PREPARING').length
    const inTransit = items.filter((o) => o.status === 'IN_TRANSIT').length
    const cancelled = items.filter((o) => o.status === 'CANCELLED').length
    const revenue = items.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
    return { todays, preparing, inTransit, cancelled, revenue }
  }, [items])

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h1 className="text-2xl font-semibold">Siparişleri Yönet</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Müşteri siparişlerini, ödeme durumunu ve kargo sürecini yönetin.</p>
        <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-5">
          <Input placeholder="Müşteri, email veya sipariş no" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <option value="all">Tüm durumlar</option>
            {['PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map((s) => (
              <option key={s} value={s}>
                {statusLabel(s as AdminOrderStatus)}
              </option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="all">Tüm ödeme durumları</option>
            <option value="PENDING_PAYMENT">Ödeme Bekliyor</option>
            <option value="PAID">Ödendi</option>
            <option value="FAILED">Başarısız</option>
            <option value="REFUNDED">İade Edildi</option>
          </select>
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          <div className="flex gap-2">
            <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            <Button onClick={() => void refresh()}>Filtrele</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Card className="p-3"><div className="text-xs text-zinc-500">Toplam</div><div className="text-xl font-semibold">{items.length}</div></Card>
        <Card className="p-3"><div className="text-xs text-zinc-500">Bugün</div><div className="text-xl font-semibold">{stats.todays}</div></Card>
        <Card className="p-3"><div className="text-xs text-zinc-500">Hazırlanan</div><div className="text-xl font-semibold">{stats.preparing}</div></Card>
        <Card className="p-3"><div className="text-xs text-zinc-500">Kargoda</div><div className="text-xl font-semibold">{stats.inTransit}</div></Card>
        <Card className="p-3"><div className="text-xs text-zinc-500">İptal</div><div className="text-xl font-semibold">{stats.cancelled}</div></Card>
        <Card className="p-3"><div className="text-xs text-zinc-500">Toplam Ciro</div><div className="text-xl font-semibold">{MONEY.format(stats.revenue)}</div></Card>
      </div>

      <Card className="overflow-x-auto p-0">
        {loading ? (
          <div className="p-6 text-sm text-zinc-600">Siparişler yükleniyor...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-zinc-600">Henüz sipariş bulunmuyor.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                {['Sipariş No', 'Müşteri', 'Email', 'Ürün', 'Toplam', 'Ödeme', 'Durum', 'Sipariş Tarihi', 'Son Güncelleme', 'İşlemler'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-zinc-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-t border-zinc-200/70 dark:border-zinc-800/70">
                  <td className="px-3 py-3">{o.orderNumber}</td>
                  <td className="px-3 py-3">{o.customerName}</td>
                  <td className="px-3 py-3">{o.customerEmail}</td>
                  <td className="px-3 py-3">{o.itemCount}</td>
                  <td className="px-3 py-3">{MONEY.format(Number(o.totalAmount))}</td>
                  <td className="px-3 py-3">{o.paymentStatus}</td>
                  <td className="px-3 py-3">{statusLabel(o.status)}</td>
                  <td className="px-3 py-3">{new Date(o.createdAt).toLocaleString('tr-TR')}</td>
                  <td className="px-3 py-3">{new Date(o.updatedAt).toLocaleString('tr-TR')}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          const d = await getAdminOrder(o.id)
                          setDetail(d)
                          setDetailOpen(true)
                        }}
                      >
                        Detay Gör
                      </Button>
                      <select
                        className="h-9 rounded-xl border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                        value={o.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as AdminOrderStatus
                          await updateAdminOrderStatus(o.id, newStatus)
                          toast.success('Sipariş durumu güncellendi.')
                          await refresh()
                        }}
                      >
                        {[o.status, ...STATUS_OPTIONS].filter((v, i, arr) => arr.indexOf(v) === i).map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" variant="danger" onClick={() => setCancelTarget(o)}>
                        İptal Et
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {detailOpen && detail ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Sipariş Detayı - {detail.orderNumber}</h3>
                <div className="mt-1 text-sm text-zinc-600">{detail.customerName} ({detail.customerEmail})</div>
              </div>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Kapat</Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Card className="p-3"><div className="text-xs text-zinc-500">Sipariş Durumu</div><div className="font-semibold">{statusLabel(detail.status)}</div></Card>
              <Card className="p-3"><div className="text-xs text-zinc-500">Ödeme</div><div className="font-semibold">{detail.paymentStatus}</div></Card>
              <Card className="p-3"><div className="text-xs text-zinc-500">Ara Toplam</div><div className="font-semibold">{MONEY.format(Number(detail.subtotal))}</div></Card>
              <Card className="p-3"><div className="text-xs text-zinc-500">Toplam</div><div className="font-semibold">{MONEY.format(Number(detail.totalAmount))}</div></Card>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 text-sm font-medium">Sipariş Timeline</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
                {TIMELINE.map((step) => {
                  const active = TIMELINE.indexOf(step) <= TIMELINE.indexOf(detail.status === 'CANCELLED' ? 'CREATED' : detail.status)
                  return (
                    <div key={step} className={`rounded-xl px-2 py-2 text-center text-xs ${active ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'}`}>
                      {statusLabel(step)}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {detail.items.map((it, idx) => (
                <div key={`${it.productId}-${idx}`} className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                  {it.imageUrl ? <img src={it.imageUrl} alt={it.productName} className="h-14 w-14 rounded-lg object-cover" /> : <div className="h-14 w-14 rounded-lg bg-zinc-100 dark:bg-zinc-900" />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{it.productName}</div>
                    <div className="text-xs text-zinc-500">{it.categoryName ?? '-'} | Adet: {it.quantity}</div>
                    <div className="text-xs text-zinc-500">Beden: {it.selectedSize ?? it.selectedShoeSize ?? '-'} | Renk: {it.selectedColor ?? '-'}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{MONEY.format(Number(it.unitPrice))}</div>
                    <div className="font-semibold">{MONEY.format(Number(it.totalPrice))}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(cancelTarget)}
        title="Siparişi İptal Et"
        description="Bu siparişi iptal etmek istediğinize emin misiniz?"
        onCancel={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return
          await cancelAdminOrder(cancelTarget.id)
          toast.success('Sipariş durumu güncellendi.')
          setCancelTarget(null)
          await refresh()
        }}
        confirmText="Evet, İptal Et"
      />
    </div>
  )
}

