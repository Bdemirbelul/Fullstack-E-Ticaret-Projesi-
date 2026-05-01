import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from './ui/Button'
import { cn } from '../utils/cn'
import { logoutLocal } from '../services/auth'
import { tokenStore } from '../services/tokenStore'
import { useTheme } from '../hooks/useTheme'
import { getMe } from '../services/me'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-xl px-3 py-2 text-sm font-medium transition',
          'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
          'dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white',
          isActive && 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white',
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const isAuthed = Boolean(tokenStore.getAccess())
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLogoOpen, setIsLogoOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadRole() {
      if (!isAuthed) {
        setIsAdmin(false)
        return
      }
      try {
        const me = await getMe()
        if (cancelled) return
        setIsAdmin(me.roles.includes('ADMIN'))
      } catch {
        if (cancelled) return
        setIsAdmin(false)
      }
    }
    void loadRole()
    return () => {
      cancelled = true
    }
  }, [isAuthed, location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/70 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/60">
      <div className="container-p flex h-16 items-center justify-between">
        <div
          role="button"
          tabIndex={0}
          aria-label="Logo isim görünürlüğünü değiştir"
          aria-expanded={isLogoOpen}
          className="group flex cursor-pointer items-center"
          onClick={() => setIsLogoOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsLogoOpen((prev) => !prev)
            }
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white shadow-soft dark:bg-white dark:text-zinc-900">
            D
          </div>
          <div
            className={cn(
              'overflow-hidden transition-all duration-500 ease-out',
              isLogoOpen ? 'ml-3 w-64 opacity-100' : 'ml-0 w-0 opacity-0',
            )}
          >
            <span className="hidden whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 sm:inline">
              BALAMIR DEMİRKAN BELÜL
            </span>
            <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 sm:hidden">
              BALAMIR D. BELÜL
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/">Anasayfa</NavItem>
          <NavItem to="/products">Ürünler</NavItem>
          <NavItem to="/favorites">Favorilerim</NavItem>
          {isAuthed ? <NavItem to="/orders">Siparişlerim</NavItem> : null}
          <NavItem to="/cart">Sepetim</NavItem>
          {isAuthed && isAdmin ? <NavItem to="/admin/products">Ürünleri Yönet</NavItem> : null}
          {isAuthed && isAdmin ? <NavItem to="/admin/orders">Siparişleri Yönet</NavItem> : null}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={toggle} aria-label="Koyu mod">
            {theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}
          </Button>

          {isAuthed ? (
            <Button
              variant="secondary"
              onClick={() => {
                logoutLocal()
                navigate('/login')
              }}
            >
              Çıkış
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Giriş
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

