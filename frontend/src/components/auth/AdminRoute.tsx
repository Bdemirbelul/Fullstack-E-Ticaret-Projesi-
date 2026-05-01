import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { tokenStore } from '../../services/tokenStore'
import { getMe } from '../../services/me'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const isAuthed = Boolean(tokenStore.getAccess())

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!isAuthed) {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      try {
        const me = await getMe()
        if (cancelled) return
        setIsAdmin(me.roles.includes('ADMIN'))
      } catch {
        if (cancelled) return
        setIsAdmin(false)
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [isAuthed])

  if (!isAuthed) return <Navigate to="/login" replace />
  if (loading) {
    return <div className="rounded-2xl border border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">Yetki kontrol ediliyor...</div>
  }
  if (!isAdmin) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">Bu sayfaya erişim yetkiniz yok.</div>
  }
  return <>{children}</>
}

