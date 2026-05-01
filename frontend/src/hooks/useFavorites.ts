import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { addFavorite, clearFavorites, listFavorites, removeFavorite, type FavoriteProduct } from '../services/favorites'
import { tokenStore } from '../services/tokenStore'

type FavoriteContextType = {
  items: FavoriteProduct[]
  productIds: number[]
  isAuthed: boolean
  loading: boolean
  has: (productId: number) => boolean
  refresh: () => Promise<void>
  toggle: (productId: number) => Promise<boolean>
  remove: (productId: number) => Promise<void>
  clear: () => Promise<void>
}

const FavoritesContext = createContext<FavoriteContextType | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [items, setItems] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [authTick, setAuthTick] = useState(0)

  useEffect(() => {
    return tokenStore.subscribe(() => setAuthTick((t) => t + 1))
  }, [])

  const refresh = useCallback(async () => {
    const token = tokenStore.getAccess()
    if (!token) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const data = await listFavorites()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!tokenStore.getAccess()) {
      setItems([])
      return
    }
    void refresh()
  }, [refresh, location.pathname, authTick])

  const has = useCallback(
    (productId: number) => {
      return items.some((item) => item.productId === productId)
    },
    [items],
  )

  const toggle = useCallback(
    async (productId: number) => {
      if (!tokenStore.getAccess()) {
        throw new Error('AUTH_REQUIRED')
      }
      const exists = items.some((item) => item.productId === productId)
      if (exists) {
        await removeFavorite(productId)
      } else {
        await addFavorite(productId)
      }
      await refresh()
      return !exists
    },
    [items, refresh],
  )

  const remove = useCallback(
    async (productId: number) => {
      if (!tokenStore.getAccess()) {
        throw new Error('AUTH_REQUIRED')
      }
      await removeFavorite(productId)
      await refresh()
    },
    [refresh],
  )

  const clear = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      throw new Error('AUTH_REQUIRED')
    }
    await clearFavorites()
    setItems([])
    // Geçmiş localStorage sürümünden kalmış olabilir, temizleyelim.
    try {
      localStorage.removeItem('favorites')
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo<FavoriteContextType>(
    () => ({
      items,
      productIds: items.map((item) => item.productId),
      isAuthed: Boolean(tokenStore.getAccess()),
      loading,
      has,
      refresh,
      toggle,
      remove,
      clear,
    }),
    [items, loading, authTick, has, refresh, toggle, remove, clear],
  )

  return createElement(FavoritesContext.Provider, { value }, children)
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return ctx
}

