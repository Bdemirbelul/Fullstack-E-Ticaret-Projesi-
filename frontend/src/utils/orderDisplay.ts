/** Müşterinin siparişi iptal edip edemeyeceği (backend kurallarıyla uyumlu). */
export function canCustomerCancelOrder(status: string): boolean {
  const s = (status ?? '').toUpperCase()
  if (!s) return false
  if (s === 'CANCELLED' || s === 'REFUNDED') return false
  if (s === 'DELIVERED' || s === 'SHIPPED' || s === 'IN_TRANSIT') return false
  return true
}

/** API durumunu kullanıcı arayüzü etiketine ve badge sınıfına çevirir. */
export function orderStatusDisplay(status: string): { label: string; badgeClass: string } {
  const s = (status ?? '').toUpperCase()
  if (s === 'PAID') {
    return {
      label: 'Ödendi',
      badgeClass:
        'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100 border border-emerald-200/80 dark:border-emerald-800/60',
    }
  }
  if (s === 'PREPARING' || s === 'CREATED' || s === 'PENDING_PAYMENT') {
    return {
      label: 'Hazırlanıyor',
      badgeClass:
        'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-100 border border-amber-200/80 dark:border-amber-800/60',
    }
  }
  if (s === 'SHIPPED' || s === 'IN_TRANSIT') {
    return {
      label: 'Kargoda',
      badgeClass:
        'bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-100 border border-sky-200/80 dark:border-sky-800/60',
    }
  }
  if (s === 'DELIVERED') {
    return {
      label: 'Teslim Edildi',
      badgeClass:
        'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100 border border-emerald-200/80 dark:border-emerald-800/60',
    }
  }
  if (s === 'PAYMENT_FAILED') {
    return {
      label: 'Ödeme başarısız',
      badgeClass:
        'bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-100 border border-rose-200/80 dark:border-rose-800/60',
    }
  }
  if (s === 'CANCELLED' || s === 'REFUNDED') {
    return {
      label: 'İptal Edildi',
      badgeClass:
        'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-300/80 dark:border-zinc-600/60',
    }
  }
  return {
    label: status || 'Bilinmiyor',
    badgeClass:
      'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
  }
}
