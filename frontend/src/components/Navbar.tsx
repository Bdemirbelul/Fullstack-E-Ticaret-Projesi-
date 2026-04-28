import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { cn } from '../utils/cn'
import { logoutLocal } from '../services/auth'
import { tokenStore } from '../services/tokenStore'
import { useTheme } from '../hooks/useTheme'

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
  const { theme, toggle } = useTheme()
  const isAuthed = Boolean(tokenStore.getAccess())

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/70 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/60">
      <div className="container-p flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-zinc-900 shadow-soft dark:bg-white" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              Luma Atelier
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              seçkin koleksiyon
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/">Ürünler</NavItem>
          <NavItem to="/favorites">Favoriler</NavItem>
          <NavItem to="/cart">Sepet</NavItem>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={toggle} aria-label="Koyu mod">
            {theme === 'dark' ? 'Açık' : 'Koyu'}
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

