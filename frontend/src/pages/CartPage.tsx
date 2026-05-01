import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  clearLocalCart,
  getItemKey,
  getLocalCartItems,
  getLocalCartSummary,
  removeLocalCartItem,
  type LocalCartItem,
  updateLocalCartItemQuantity,
} from '../services/localCart'
import { type DeliveryDetailsRequest } from '../services/orders'
import { clearCart, upsertCartItem } from '../services/cart'
import { iyzicoCheckoutFromCart, IYZICO_CHECKOUT_SESSION_KEY } from '../services/payments'
import { tokenStore } from '../services/tokenStore'
import { CheckoutDeliveryModal } from '../components/cart/CheckoutDeliveryModal'

function money(v: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(v))
}

export function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<LocalCartItem[]>([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const summary = useMemo(() => getLocalCartSummary(items), [items])
  async function handleCheckout(deliveryDetails: DeliveryDetailsRequest) {
    if (!tokenStore.getAccess()) {
      toast.error('Sipariş vermek için giriş yapmalısınız.')
      navigate('/login')
      return
    }

    setCheckingOut(true)
    try {
      // Backend order creation uses server-side cart, so sync local cart first.
      await clearCart()
      const quantitiesByProduct = new Map<number, number>()
      for (const item of items) {
        quantitiesByProduct.set(item.productId, (quantitiesByProduct.get(item.productId) ?? 0) + item.quantity)
      }
      for (const [productId, quantity] of quantitiesByProduct) {
        await upsertCartItem(productId, quantity)
      }

      const payment = await iyzicoCheckoutFromCart({ deliveryDetails })

      if (payment.paymentPageUrl) {
        setCheckoutOpen(false)
        window.location.href = payment.paymentPageUrl
        return
      }

      if (payment.checkoutFormContent) {
        sessionStorage.setItem(IYZICO_CHECKOUT_SESSION_KEY, payment.checkoutFormContent)
        setCheckoutOpen(false)
        navigate('/payment')
        return
      }

      toast.error('Ödeme oturumu başlatılamadı.')
    } catch {
      toast.error('Ödeme başlatılırken bir hata oluştu.')
    } finally {
      setCheckingOut(false)
    }
  }


  useEffect(() => {
    setItems(getLocalCartItems())
  }, [])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Sepetim</h1>
          <Link
            to="/"
            className="rounded-2xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Alışverişe Devam Et
          </Link>
        </div>

        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((it) => (
              <Card key={getItemKey(it)} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {it.imageUrl ? (
                    <img src={it.imageUrl} alt={it.name} className="h-20 w-20 rounded-2xl object-cover" />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{it.name}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{it.categoryName}</div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {it.hasDiscount ? (
                        <>
                          <span className="line-through text-zinc-400">{money(it.originalPrice)}</span>{' '}
                          <span className="font-semibold text-rose-600 dark:text-rose-400">{money(it.finalPrice)}</span>
                        </>
                      ) : (
                        money(it.finalPrice)
                      )}
                    </div>
                    {(it.selectedSize || it.selectedShoeSize || it.selectedColor) && (
                      <div className="mt-1 text-xs text-zinc-500">
                        {[it.selectedShoeSize, it.selectedSize, it.selectedColor].filter(Boolean).join(' • ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const next = updateLocalCartItemQuantity(getItemKey(it), Math.max(1, it.quantity - 1))
                        setItems(next)
                      }}
                    >
                      −
                    </Button>
                    <div className="w-10 text-center text-sm">{it.quantity}</div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const next = updateLocalCartItemQuantity(getItemKey(it), it.quantity + 1)
                        setItems(next)
                      }}
                    >
                      +
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:w-48 sm:justify-end">
                    <div className="text-sm font-medium">{money(it.totalPrice)}</div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const next = removeLocalCartItem(getItemKey(it))
                        setItems(next)
                        toast.success('Kaldirildi.')
                      }}
                    >
                      Kaldır
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Sepetin boş.</div>
            </Card>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-20 p-6">
          <div className="text-lg font-semibold">Sipariş Özeti</div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-zinc-600 dark:text-zinc-400">Ara Toplam</div>
            <div className="font-medium">{money(summary.subtotal)}</div>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="text-zinc-600 dark:text-zinc-400">Indirim</div>
            <div className="font-medium text-rose-600">- {money(summary.discountTotal)}</div>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="text-zinc-600 dark:text-zinc-400">Toplam</div>
            <div className="font-semibold">{money(summary.grandTotal)}</div>
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={items.length === 0 || checkingOut}
            onClick={() => {
              if (!tokenStore.getAccess()) {
                toast.error('Sipariş vermek için giriş yapmalısınız.')
                navigate('/login')
                return
              }
              setCheckoutOpen(true)
            }}
          >
            Siparişi Tamamla
          </Button>

          <Button
            className="mt-3 w-full"
            variant="secondary"
            disabled={items.length === 0}
            onClick={() => {
              clearLocalCart()
              setItems([])
              toast.success('Sepet temizlendi.')
            }}
          >
            Sepeti Temizle
          </Button>
        </Card>
      </div>

      <CheckoutDeliveryModal
        open={checkoutOpen}
        loading={checkingOut}
        onClose={() => !checkingOut && setCheckoutOpen(false)}
        onSubmit={handleCheckout}
      />
    </div>
  )
}

