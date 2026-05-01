import { useMemo, useState } from 'react'
import { Button } from '../ui/Button'
import type { DeliveryDetailsRequest } from '../../services/orders'

type Props = {
  open: boolean
  loading: boolean
  onClose: () => void
  onSubmit: (payload: DeliveryDetailsRequest) => Promise<void>
}

type Errors = Partial<Record<keyof DeliveryDetailsRequest, string>>

const initialForm: DeliveryDetailsRequest = {
  recipientFirstName: '',
  recipientLastName: '',
  phoneNumber: '',
  alternativePhoneNumber: '',
  city: '',
  district: '',
  neighborhood: '',
  addressLine: '',
  buildingNo: '',
  floorNo: '',
  apartmentNo: '',
  postalCode: '',
  deliveryNote: '',
  ifUnreachableLeaveTo: '',
  addressTitle: '',
}

function validate(form: DeliveryDetailsRequest): Errors {
  const errors: Errors = {}
  if (!form.recipientFirstName.trim()) errors.recipientFirstName = 'Alıcı adı zorunludur.'
  if (!form.recipientLastName.trim()) errors.recipientLastName = 'Alıcı soyadı zorunludur.'
  if (!form.phoneNumber.trim()) errors.phoneNumber = 'Telefon zorunludur.'
  else if (form.phoneNumber.replace(/\D/g, '').length < 10) {
    errors.phoneNumber = 'Telefon en az 10 karakter olmalıdır.'
  }
  if (!form.city.trim()) errors.city = 'İl zorunludur.'
  if (!form.district.trim()) errors.district = 'İlçe zorunludur.'
  if (!form.addressLine.trim()) errors.addressLine = 'Açık adres zorunludur.'
  return errors
}

export function CheckoutDeliveryModal({ open, loading, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<DeliveryDetailsRequest>(initialForm)
  const [errors, setErrors] = useState<Errors>({})
  const stepItems = useMemo(() => ['Sepet', 'Teslimat Bilgileri', 'Ödeme'], [])

  if (!open) return null

  async function submitForm() {
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await onSubmit({
      ...form,
      recipientFirstName: form.recipientFirstName.trim(),
      recipientLastName: form.recipientLastName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      addressLine: form.addressLine.trim(),
    })
  }

  function inputClass(hasError?: boolean) {
    return [
      'w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition dark:bg-zinc-950',
      hasError
        ? 'border-rose-400 focus:border-rose-500'
        : 'border-zinc-200 focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500',
    ].join(' ')
  }

  const setField = <K extends keyof DeliveryDetailsRequest>(key: K, value: DeliveryDetailsRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-6 w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {stepItems.map((step, idx) => (
              <span
                key={step}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  idx === 1
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'
                }`}
              >
                {idx + 1}. {step}
              </span>
            ))}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Teslimat Bilgileri</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Siparişinizi tamamlamak için teslimat bilgilerinizi girin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Alıcı Bilgileri</h3>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Alıcı Adı *</label>
              <input className={inputClass(!!errors.recipientFirstName)} value={form.recipientFirstName} onChange={(e) => setField('recipientFirstName', e.target.value)} />
              {errors.recipientFirstName ? <p className="mt-1 text-xs text-rose-600">{errors.recipientFirstName}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Alıcı Soyadı *</label>
              <input className={inputClass(!!errors.recipientLastName)} value={form.recipientLastName} onChange={(e) => setField('recipientLastName', e.target.value)} />
              {errors.recipientLastName ? <p className="mt-1 text-xs text-rose-600">{errors.recipientLastName}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Telefon Numarası *</label>
              <input className={inputClass(!!errors.phoneNumber)} value={form.phoneNumber} onChange={(e) => setField('phoneNumber', e.target.value)} />
              {errors.phoneNumber ? <p className="mt-1 text-xs text-rose-600">{errors.phoneNumber}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Alternatif Telefon</label>
              <input className={inputClass()} value={form.alternativePhoneNumber ?? ''} onChange={(e) => setField('alternativePhoneNumber', e.target.value)} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Adres Bilgileri</h3>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Adres Başlığı</label>
              <input className={inputClass()} value={form.addressTitle ?? ''} onChange={(e) => setField('addressTitle', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">İl *</label>
                <input className={inputClass(!!errors.city)} value={form.city} onChange={(e) => setField('city', e.target.value)} />
                {errors.city ? <p className="mt-1 text-xs text-rose-600">{errors.city}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">İlçe *</label>
                <input className={inputClass(!!errors.district)} value={form.district} onChange={(e) => setField('district', e.target.value)} />
                {errors.district ? <p className="mt-1 text-xs text-rose-600">{errors.district}</p> : null}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Mahalle</label>
              <input className={inputClass()} value={form.neighborhood ?? ''} onChange={(e) => setField('neighborhood', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Açık Adres *</label>
              <textarea
                className={`${inputClass(!!errors.addressLine)} min-h-24 resize-y`}
                value={form.addressLine}
                onChange={(e) => setField('addressLine', e.target.value)}
              />
              {errors.addressLine ? <p className="mt-1 text-xs text-rose-600">{errors.addressLine}</p> : null}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Bina No</label>
                <input className={inputClass()} value={form.buildingNo ?? ''} onChange={(e) => setField('buildingNo', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Kat</label>
                <input className={inputClass()} value={form.floorNo ?? ''} onChange={(e) => setField('floorNo', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Daire No</label>
                <input className={inputClass()} value={form.apartmentNo ?? ''} onChange={(e) => setField('apartmentNo', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Posta Kodu</label>
              <input className={inputClass()} value={form.postalCode ?? ''} onChange={(e) => setField('postalCode', e.target.value)} />
            </div>
          </section>

          <section className="space-y-4 md:col-span-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Teslimat Notu</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Kurye Notu</label>
                <textarea
                  className={`${inputClass()} min-h-24 resize-y`}
                  value={form.deliveryNote ?? ''}
                  onChange={(e) => setField('deliveryNote', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Ulaşılamazsa kime bırakılsın?</label>
                <textarea
                  className={`${inputClass()} min-h-24 resize-y`}
                  value={form.ifUnreachableLeaveTo ?? ''}
                  onChange={(e) => setField('ifUnreachableLeaveTo', e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 p-5 sm:flex-row sm:justify-end dark:border-zinc-800">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Vazgeç
          </Button>
          <Button onClick={() => void submitForm()} disabled={loading}>
            {loading ? 'Ödeme hazırlanıyor...' : 'Ödemeye Geç'}
          </Button>
        </div>
      </div>
    </div>
  )
}
