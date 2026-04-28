import { useMemo } from 'react'
import { useLocalStorageState } from './useLocalStorage'

export function useFavorites() {
  const [ids, setIds] = useLocalStorageState<number[]>('favorites', [])

  return useMemo(() => {
    const set = new Set(ids)
    return {
      ids,
      has: (id: number) => set.has(id),
      add: (id: number) => setIds((prev) => (prev.includes(id) ? prev : [id, ...prev])),
      remove: (id: number) => setIds((prev) => prev.filter((x) => x !== id)),
      toggle: (id: number) =>
        setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev])),
      clear: () => setIds([]),
    }
  }, [ids, setIds])
}

