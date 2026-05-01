import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { listCategories, listProducts, type Category, type Product } from '../services/products'
import { ProductCard } from '../components/products/ProductCard'
import { ProductOptionsModal } from '../components/products/ProductOptionsModal'
import { CategoryBar } from '../components/products/CategoryBar'

const SORT_OPTIONS = [
  { value: '', label: 'Varsayılan sıralama' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'stock_asc', label: 'Stok: Azdan Çoğa' },
  { value: 'stock_desc', label: 'Stok: Çoktan Aza' },
  { value: 'newest', label: 'En Yeni Ürünler' },
  { value: 'discount', label: 'İndirimdekiler' },
]
const MAIN_CATEGORY_IDS = [1, 2, 3, 4, 5]
const PERSONAL_CARE_LEAF_SLUGS = new Set(['makyaj', 'cilt-bakimi', 'sac-bakimi', 'parfum', 'agiz-bakimi'])
const FALLBACK_CHILD_CATEGORY_IDS: Record<number, number[]> = {
  1: [8, 11, 12, 13, 14], // Ayakkabi
  2: [6, 7, 9, 10, 15], // Giyim
  3: [18, 21, 24, 26, 32], // Elektronik
  4: [19, 20, 22, 23, 27], // Aksesuar
  /** Ev & Yaşam: doğrudan alt kategoriler; Kişisel Bakım hub slug ile birleştirilir */
  5: [16, 17, 25, 28, 29, 30, 31, 33],
}

export function ProductsPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [sort, setSort] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const normalizedCategories = useMemo(() => categories.map(normalizeCategory), [categories])

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput), 250)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    console.log('RAW CATEGORIES:', categories)
  }, [categories])

  useEffect(() => {
    if (!categories.length) return

    const params = new URLSearchParams(location.search)
    const categoryIdQuery = params.get('categoryId')
    if (categoryIdQuery) {
      const parsed = Number(categoryIdQuery)
      if (Number.isFinite(parsed)) {
        const category = categories.find((item) => Number(item.id) === parsed) ?? null
        setSelectedCategory(category)
        return
      }
    }

    const categorySlug = params.get('category')
    const subCategorySlug = params.get('subcategory')

    if (subCategorySlug) {
      const sub = categories.find((c) => c.slug === subCategorySlug)
      if (sub) {
        setSelectedCategory(sub)
        return
      }
    }

    if (categorySlug) {
      const main = categories.find((c) => c.slug === categorySlug)
      if (main) {
        setSelectedCategory(main)
        return
      }
    }

    if (!categoryIdQuery && !categorySlug && !subCategorySlug) {
      setSelectedCategory(null)
    } else if (!categoryIdQuery && (categorySlug || subCategorySlug)) {
      setSelectedCategory(null)
    }
  }, [location.search, categories])

  useEffect(() => {
    const currentCategoryId = searchParams.get('categoryId')
    const selectedCategoryId = selectedCategory ? Number(selectedCategory.id) : null
    const idsMatch = (currentCategoryId ? Number(currentCategoryId) : null) === selectedCategoryId

    if (idsMatch) {
      if (
        selectedCategoryId !== null &&
        (searchParams.has('category') || searchParams.has('subcategory'))
      ) {
        const params = new URLSearchParams(searchParams)
        params.delete('category')
        params.delete('subcategory')
        setSearchParams(params, { replace: true })
      }
      return
    }

    const params = new URLSearchParams(searchParams)
    if (selectedCategoryId !== null) {
      params.set('categoryId', String(selectedCategoryId))
      params.delete('category')
      params.delete('subcategory')
    } else {
      params.delete('categoryId')
      params.delete('category')
      params.delete('subcategory')
    }
    setSearchParams(params, { replace: true })
  }, [searchParams, selectedCategory, setSearchParams])

  const mainCategories = useMemo(
    () =>
      normalizedCategories.filter((category) => {
        return MAIN_CATEGORY_IDS.includes(Number(category.id))
      }),
    [normalizedCategories],
  )

  const getChildCategories = (parentId: number) => {
    const directChildren = normalizedCategories.filter((category) => Number(getParentId(category)) === Number(parentId))
    if (directChildren.length > 0) return directChildren

    let fallbackIds = [...(FALLBACK_CHILD_CATEGORY_IDS[Number(parentId)] ?? [])]
    if (Number(parentId) === 5) {
      const hub = normalizedCategories.find((c) => c.slug === 'kisisel-bakim')
      if (hub) fallbackIds = [...new Set([...fallbackIds, Number(hub.id)])]
    }

    if (fallbackIds.length > 0) {
      return normalizedCategories.filter((category) => fallbackIds.includes(Number(category.id)))
    }

    const hub = normalizedCategories.find((c) => c.slug === 'kisisel-bakim')
    if (hub && Number(hub.id) === Number(parentId)) {
      const bySlug = normalizedCategories.filter((c) => PERSONAL_CARE_LEAF_SLUGS.has(c.slug))
      if (bySlug.length > 0) return bySlug
    }
    return []
  }

  const collectDescendantCategoryIds = (parentId: number, depth = 0): number[] => {
    if (depth > 15) return []
    const children = getChildCategories(parentId)
    if (children.length === 0) return []
    const childIds = children.map((c) => Number(c.id))
    const nested = childIds.flatMap((id) => collectDescendantCategoryIds(id, depth + 1))
    return [...new Set([...childIds, ...nested])]
  }

  const getAllowedCategoryIds = (category: Category | null) => {
    if (!category) return []
    const selectedId = Number(category.id)
    const descendantIds = collectDescendantCategoryIds(selectedId)
    if (descendantIds.length > 0) return [selectedId, ...descendantIds]
    return [selectedId]
  }

  const selectedRootMainCategoryId = useMemo(
    () => (selectedCategory ? getRootMainCategoryId(selectedCategory, normalizedCategories) : null),
    [selectedCategory, normalizedCategories],
  )

  const allowedCategoryIds = useMemo(
    () => getAllowedCategoryIds(selectedCategory),
    [selectedCategory, normalizedCategories],
  )

  const filteredProducts = useMemo(() => {
    return shuffledProducts.filter((product) => {
      const matchesSearch = search
        ? product.name.toLowerCase().includes(search.toLowerCase())
        : true

      if (!selectedCategory) return matchesSearch
      const productCategoryId = getProductCategoryId(product)
      return matchesSearch && allowedCategoryIds.includes(productCategoryId)
    })
  }, [allowedCategoryIds, search, selectedCategory, shuffledProducts])

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await listCategories()
        setCategories(data)
      } catch {
        setCategories([])
      }
    }

    void loadCategories()
  }, [])

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)
        const data = await listProducts({
          search: search || undefined,
          sort: sort === 'discount' ? undefined : sort || undefined,
          discounted: sort === 'discount' ? true : undefined,
        })
        setProducts(data)
      } catch {
        setError('Ürünler yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    void loadProducts()
  }, [search, sort])

  useEffect(() => {
    if (!products || products.length === 0) {
      setShuffledProducts([])
      return
    }
    setShuffledProducts(shuffleArray(products))
  }, [products])

  useEffect(() => {
    console.log('RAW CATEGORIES:', categories)
    console.log('normalizedCategories', normalizedCategories)
    console.log('mainCategories', mainCategories)
    console.log(
      'Ev Yasam children',
      getChildCategories(5).map((item) => ({ id: item.id, name: item.name, parentId: getParentId(item) })),
    )
    console.log('selectedCategory', selectedCategory)
    console.log('children', selectedCategory ? getChildCategories(Number(selectedCategory.id)) : [])
    console.log('allowedCategoryIds', selectedCategory ? getAllowedCategoryIds(selectedCategory) : [])
    console.log(
      'products category ids',
      shuffledProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category_id: p.category_id ?? p.categoryId,
      })),
    )
    console.log('filteredProducts', filteredProducts)
  }, [categories, filteredProducts, mainCategories, normalizedCategories, selectedCategory, shuffledProducts])

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Ürünler</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Modern filtreleme ile istediğin ürünü hızlıca bul.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <label className="relative">
            <span className="sr-only">Ürün ara</span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Ürün ara..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
            />
          </label>

          <select
            value={selectedCategory && selectedRootMainCategoryId != null ? String(selectedRootMainCategoryId) : 'all'}
            onChange={(event) => {
              const value = event.target.value
              if (value === 'all') {
                setSelectedCategory(null)
                return
              }
              const category = mainCategories.find((c) => Number(c.id) === Number(value))
              setSelectedCategory(category ?? null)
            }}
            className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
          >
            <option value="all">Tümü</option>
            {mainCategories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value || 'default'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <CategoryBar
          mainCategories={mainCategories}
          selectedCategory={selectedCategory}
          selectedRootMainCategoryId={selectedRootMainCategoryId}
          getChildCategories={getChildCategories}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {loading && <p className="text-sm text-zinc-500">Ürünler yükleniyor...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Bu filtrelere uygun ürün bulunamadı.
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onOpenOptions={setSelectedProduct} />
          ))}
        </div>
      )}

      <ProductOptionsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  )
}

function getParentId(category: Category) {
  const parentId = category.parent_id ?? category.parentId ?? (category as { parent?: number | { id?: number } | null }).parent
  if (typeof parentId === 'object' && parentId !== null) {
    return parentId.id !== undefined && parentId.id !== null ? Number(parentId.id) : null
  }
  return parentId === undefined || parentId === null ? null : Number(parentId)
}

function getRootMainCategoryId(category: Category, normalized: Category[]): number | null {
  let current: Category | undefined = category
  for (let depth = 0; depth < 12 && current; depth += 1) {
    if (MAIN_CATEGORY_IDS.includes(Number(current.id))) return Number(current.id)
    const p = getParentId(current)
    if (p === null) return Number(current.id)
    current = normalized.find((c) => Number(c.id) === p)
  }
  return null
}

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    id: Number(category.id),
    parentId: getParentId(category),
  }
}

function getProductCategoryId(product: Product) {
  return Number(product.category_id ?? product.categoryId)
}

function shuffleArray<T>(array: T[]) {
  const cloned = [...array]
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cloned[i], cloned[j]] = [cloned[j], cloned[i]]
  }
  return cloned
}

