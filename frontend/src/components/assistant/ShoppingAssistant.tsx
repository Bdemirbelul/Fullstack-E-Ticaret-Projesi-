import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import { postAssistantChat, type AssistantChatContext } from '../../services/assistant'
import { getLocalCartItems } from '../../services/localCart'
import { tokenStore } from '../../services/tokenStore'
import { cn } from '../../utils/cn'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const WELCOME =
  'Merhaba, ben alışveriş asistanınız. Siparişler, iadeler, kampanyalar ve ürünler hakkında yardımcı olabilirim.'

const QUICK_ACTIONS = [
  { label: 'Siparişlerim', prompt: 'Siparişlerim hakkında yardım istiyorum' },
  { label: 'İade & İptaller', prompt: 'İade süreci hakkında bilgi almak istiyorum' },
  { label: 'Eksik / Yanlış / Hasarlı Ürün', prompt: 'Eksik, yanlış veya hasarlı ürün bildirmek istiyorum' },
  { label: 'Kupon & Kampanyalar', prompt: 'Kampanyaları ve kuponları görmek istiyorum' },
  { label: 'Üyelik & Hesap İşlemlerim', prompt: 'Üyelik ve hesap işlemlerim hakkında bilgi istiyorum' },
  { label: 'Ürün Önerisi', prompt: 'Bana ürün önerir misin?' },
]

function pageFromPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'home'
  if (pathname === '/products') return 'products'
  if (pathname.startsWith('/products/')) return 'product-detail'
  if (pathname === '/cart') return 'cart'
  if (pathname === '/favorites') return 'favorites'
  if (pathname.startsWith('/orders')) return 'orders'
  if (pathname === '/login') return 'login'
  if (pathname === '/register') return 'register'
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/payment')) return 'payment'
  return 'other'
}

function buildContext(pathname: string, search: string): AssistantChatContext {
  const params = new URLSearchParams(search)
  const categoryId = params.get('categoryId')
  const categorySlug = params.get('category')
  const subSlug = params.get('subcategory')
  let selectedCategory: string | null = null
  if (subSlug) selectedCategory = subSlug
  else if (categorySlug) selectedCategory = categorySlug
  else if (categoryId) selectedCategory = `id:${categoryId}`

  const items = getLocalCartItems().map((i) => ({
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    finalPrice: i.finalPrice,
    categoryName: i.categoryName,
  }))

  return {
    page: pageFromPath(pathname),
    selectedCategory,
    cartItems: items,
  }
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-rose-400 dark:bg-rose-300"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

export function ShoppingAssistant() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true
      setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME }])
    }
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, open])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const context = buildContext(location.pathname, location.search)
      const { reply } = await postAssistantChat({ message: trimmed, context })
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: reply || 'Yanıt alınamadı.' },
      ])
    } catch (err) {
      let detail =
        'Backend\'e ulaşılamıyor. Spring uygulamasının çalıştığından ve adresin doğru olduğundan emin olun (ör. http://localhost:8080).'
      if (axios.isAxiosError(err)) {
        if (err.response) {
          detail = `Sunucu hatası (${err.response.status}). Asistan endpoint\'i veya Ollama ayarlarını kontrol edin.`
        } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          detail =
            'Ağ hatası: Tarayıcı backend\'e bağlanamıyor (genelde backend kapalı, yanlış VITE_API_BASE_URL veya CORS).'
        }
      }
      if (import.meta.env.DEV && err instanceof Error) {
        console.error('[ShoppingAssistant]', err.message, err)
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: `${detail} Siparişleriniz için giriş yapıp ilgili sayfayı ziyaret edebilirsiniz.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [loading, location.pathname, location.search])

  const handleQuickAction = useCallback(
    (label: string, prompt: string) => {
      if (label === 'Siparişlerim') {
        setOpen(false)
        if (tokenStore.getAccess()) navigate('/orders')
        else navigate('/login')
        return
      }
      void sendMessage(prompt)
    },
    [navigate, sendMessage],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const t = input
    setInput('')
    void sendMessage(t)
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <div className="group relative">
          <span
            className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            role="tooltip"
          >
            Asistana sor
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Asistanı kapat' : 'Alışveriş asistanını aç'}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
              'bg-gradient-to-br from-rose-500 to-rose-600 text-white ring-2 ring-rose-200/80 hover:scale-105 hover:shadow-xl',
              'dark:from-zinc-800 dark:to-black dark:ring-zinc-600 dark:text-rose-300',
            )}
          >
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3C7.03 3 3 6.58 3 11c0 2.13.9 4.08 2.37 5.47L4 21l4.73-1.18C10.15 20.6 11.05 21 12 21c4.97 0 9-3.58 9-8s-4.03-8-9-8z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="11" r="1" fill="currentColor" />
              <circle cx="15" cy="11" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px] dark:bg-black/40 sm:bg-transparent sm:backdrop-blur-none"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed z-[95] flex max-h-[min(560px,calc(100vh-6rem))] w-[min(100vw-1.5rem,400px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950',
          'bottom-24 right-3 sm:bottom-24 sm:right-6',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        aria-hidden={!open}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-zinc-200 bg-gradient-to-r from-rose-50 to-white px-4 py-3 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Alışveriş asistanı</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">7/24 yardımcı olmaya çalışırım</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Kapat"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div
          ref={listRef}
          className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'ml-auto bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'mr-auto border border-zinc-100 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100',
              )}
            >
              {m.content}
            </div>
          ))}
          {loading ? (
            <div className="mr-auto flex max-w-[92%] items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
              <TypingIndicator />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Yazıyor…</span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Hızlı seçim
          </p>
          <div className="no-scrollbar flex max-h-[72px] flex-wrap gap-1.5 overflow-y-auto">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                disabled={loading}
                onClick={() => handleQuickAction(a.label, a.prompt)}
                className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-rose-900 dark:hover:bg-rose-950/40"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajınızı yazın…"
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-rose-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-rose-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-45 dark:bg-rose-600 dark:hover:bg-rose-500"
            >
              Gönder
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
