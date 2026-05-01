import { useRef, useState } from 'react'
import type { Category } from '../../services/products'
import { CategoryMegaMenu } from './CategoryMegaMenu'

type Props = {
  mainCategories: Category[]
  selectedCategory: Category | null
  /** Ana şeritte vurgulanacak kök kategori (1–5); iç içe seçimler için */
  selectedRootMainCategoryId: number | null
  getChildCategories: (parentId: number) => Category[]
  onSelectCategory: (category: Category | null) => void
}

export function CategoryBar({
  mainCategories,
  selectedCategory,
  selectedRootMainCategoryId,
  getChildCategories,
  onSelectCategory,
}: Props) {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null)
  const closeTimer = useRef<number | null>(null)

  function cancelClose() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setHoveredCategoryId(null), 160)
  }

  function isHoverDevice() {
    return typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  }

  return (
    <div className="relative mt-4 space-y-2" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
            selectedCategory === null
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          Tümü
        </button>

        {mainCategories.map((category) => {
          const isSelected =
            selectedRootMainCategoryId !== null && Number(selectedRootMainCategoryId) === Number(category.id)
          return (
            <button
              key={category.id}
              type="button"
              onMouseEnter={() => {
                if (isHoverDevice()) setHoveredCategoryId(Number(category.id))
              }}
              onClick={() => {
                onSelectCategory(category)
                if (isHoverDevice()) {
                  setHoveredCategoryId(Number(category.id))
                } else {
                  setHoveredCategoryId((prev) => (prev === Number(category.id) ? null : Number(category.id)))
                }
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {category.name}
            </button>
          )
        })}
      </div>

      {mainCategories.map((mainCategory) => {
        const children = getChildCategories(Number(mainCategory.id)).map((child) => ({
          id: Number(child.id),
          name: child.name,
          icon: '•',
        }))

        return (
          <CategoryMegaMenu
            key={mainCategory.id}
            open={hoveredCategoryId === Number(mainCategory.id) && children.length > 0}
            categoryName={mainCategory.name}
            items={children}
            onSelectMain={() => {
              onSelectCategory(mainCategory)
              setHoveredCategoryId(null)
            }}
            onSelectSub={(childId) => {
              const child = getChildCategories(Number(mainCategory.id)).find(
                (category) => Number(category.id) === Number(childId),
              )
              onSelectCategory(child ?? null)
              setHoveredCategoryId(null)
            }}
          />
        )
      })}
    </div>
  )
}
