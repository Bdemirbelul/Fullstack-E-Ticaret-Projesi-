import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { cancelMyOrder, getMyOrder, orderItemLineTotal, type OrderResponse } from '../services/orders'
import { tokenStore } from '../services/tokenStore'
import { canCustomerCancelOrder, orderStatusDisplay } from '../utils/orderDisplay'
import { cn } from '../utils/cn'

function money(v: number) {
  const n = Number.isFinite(v) ? v : 0
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    if (!tokenStore.getAccess()) {
      navigate('/login', { replace: true })
      return
    }
    const orderId = Number(id)
    if (!id || Number.isNaN(orderId)) {
      toast.error('Geçersiz sipariş.')
      navigate('/orders', { replace: true })
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await getMyOrder(orderId)
        if (!cancelled) setOrder(data)
      } catch {
        if (!cancelled) {
          toast.error('Sipariş bulunamadı veya erişim yetkiniz yok.')
          navigate('/orders', { replace: true })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  if (loading || !order) {
    return (
      <div className="mx-auto max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
        Sipariş yükleniyor…
      </div>
    )
  }

  const { label, badgeClass } = orderStatusDisplay(order.status)
  const showCancel = canCustomerCancelOrder(order.status)

  async function handleConfirmCancel() {
    if (!order) return
    setCancelLoading(true)
    try {
      const updated = await cancelMyOrder(order.id)
      setOrder(updated)
      setCancelOpen(false)
      toast.success('Siparişiniz iptal edildi.')
    } catch (e: unknown) {
      let msg = 'Sipariş iptal edilemedi.'
      if (axios.isAxiosError(e)) {
        const data = e.response?.data
        if (data && typeof data === 'object' && data !== null && 'message' in data) {
          const m = (data as { message?: unknown }).message
          if (typeof m === 'string' && m.length > 0) msg = m
        }
      }
      toast.error(msg)
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/orders"
            className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
          >
            ← Siparişlerime dön
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Sipariş {order.orderNumber || `#${order.id}`}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium', badgeClass)}
          >
            {label}
          </span>
          <div className="text-right text-sm text-zinc-500 dark:text-zinc-400">Sipariş tutarı</div>
          <div className="text-xl font-semibold tabular-nums">{money(order.totalPrice)}</div>
          {showCancel ? (
            <Button variant="secondary" className="mt-1 w-full sm:w-auto" onClick={() => setCancelOpen(true)}>
              İptal / İade talebi
            </Button>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        isOpen={cancelOpen}
        title="Siparişi iptal etmek istiyor musunuz?"
        description="Emin misiniz? Onaylarsanız siparişiniz iptal edilmiş olarak güncellenecektir. Kargoya verilmiş veya teslim edilmiş siparişler bu yolla iptal edilemez."
        confirmText="Evet, iptal et"
        cancelText="Vazgeç"
        confirmLoadingText="İptal ediliyor…"
        loading={cancelLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => !cancelLoading && setCancelOpen(false)}
      />

      <Card className="overflow-hidden">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ürünler</h2>
        </div>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {order.items.map((it, idx) => (
            <li key={`${order.id}-${it.productId}-${idx}`} className="flex gap-4 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{it.productName}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Birim: {money(it.unitPrice)} × {it.quantity}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold tabular-nums">{money(orderItemLineTotal(it))}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-end border-t border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Toplam: </span>
            <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {money(order.totalPrice)}
            </span>
          </div>
        </div>
      </Card>

      {order.deliveryDetails ? (
        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Teslimat Bilgileri</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <div className="text-zinc-500 dark:text-zinc-400">Alıcı</div>
              <div className="font-medium">
                {order.deliveryDetails.recipientFirstName} {order.deliveryDetails.recipientLastName}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 dark:text-zinc-400">Telefon</div>
              <div className="font-medium">{order.deliveryDetails.phoneNumber}</div>
              {order.deliveryDetails.alternativePhoneNumber ? (
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Alternatif: {order.deliveryDetails.alternativePhoneNumber}
                </div>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <div className="text-zinc-500 dark:text-zinc-400">Adres</div>
              <div className="font-medium">
                {[order.deliveryDetails.addressTitle, order.deliveryDetails.city, order.deliveryDetails.district]
                  .filter(Boolean)
                  .join(' • ')}
              </div>
              <div className="mt-1 text-zinc-700 dark:text-zinc-300">
                {[
                  order.deliveryDetails.neighborhood,
                  order.deliveryDetails.addressLine,
                  order.deliveryDetails.buildingNo ? `Bina: ${order.deliveryDetails.buildingNo}` : '',
                  order.deliveryDetails.floorNo ? `Kat: ${order.deliveryDetails.floorNo}` : '',
                  order.deliveryDetails.apartmentNo ? `Daire: ${order.deliveryDetails.apartmentNo}` : '',
                  order.deliveryDetails.postalCode ? `Posta Kodu: ${order.deliveryDetails.postalCode}` : '',
                ]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </div>
            {order.deliveryDetails.deliveryNote ? (
              <div className="sm:col-span-2">
                <div className="text-zinc-500 dark:text-zinc-400">Teslimat Notu</div>
                <div className="font-medium">{order.deliveryDetails.deliveryNote}</div>
              </div>
            ) : null}
            {order.deliveryDetails.ifUnreachableLeaveTo ? (
              <div className="sm:col-span-2">
                <div className="text-zinc-500 dark:text-zinc-400">Ulaşılamazsa</div>
                <div className="font-medium">{order.deliveryDetails.ifUnreachableLeaveTo}</div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Button variant="secondary" onClick={() => navigate('/orders')}>
        Tüm siparişler
      </Button>
    </div>
  )
}
