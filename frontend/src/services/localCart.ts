import type { Product } from './products'

const CART_KEY = 'bootcamp_cart_v1'

export type LocalCartItem = {
  productId: number
  name: string
  originalPrice: number
  finalPrice: number
  discountPercentage: number
  hasDiscount: boolean
  quantity: number
  imageUrl: string
  categoryId: number | null
  categoryName: string
  selectedSize?: string
  selectedShoeSize?: string
  selectedColor?: string
  totalPrice: number
}

export type LocalCartSummary = {
  subtotal: number
  discountTotal: number
  grandTotal: number
}

function readCart() {
  const raw = localStorage.getItem(CART_KEY)
  if (!raw) return [] as LocalCartItem[]
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LocalCartItem[]) : []
  } catch {
    return []
  }
}

function writeCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToLocalCart(
  product: Product,
  quantity: number,
  options: { selectedSize?: string; selectedShoeSize?: string; selectedColor?: string },
  imageUrl: string,
) {
  const current = readCart()
  const sameIndex = current.findIndex(
    (item) =>
      item.productId === product.id &&
      item.selectedSize === options.selectedSize &&
      item.selectedShoeSize === options.selectedShoeSize &&
      item.selectedColor === options.selectedColor,
  )

  if (sameIndex >= 0) {
    const mergedQty = current[sameIndex].quantity + quantity
    current[sameIndex] = {
      ...current[sameIndex],
      quantity: mergedQty,
      totalPrice: product.finalPrice * mergedQty,
    }
    writeCart(current)
    return current[sameIndex]
  }

  const item: LocalCartItem = {
    productId: product.id,
    name: product.name,
    originalPrice: product.originalPrice,
    finalPrice: product.finalPrice,
    discountPercentage: product.discountPercentage ?? 0,
    hasDiscount: product.hasDiscount,
    quantity,
    imageUrl,
    categoryId: product.categoryId ?? null,
    categoryName: product.categoryName ?? 'Kategori',
    selectedSize: options.selectedSize,
    selectedShoeSize: options.selectedShoeSize,
    selectedColor: options.selectedColor,
    totalPrice: product.finalPrice * quantity,
  }
  writeCart([...current, item])
  return item
}

export function getLocalCartItems() {
  return readCart()
}

export function updateLocalCartItemQuantity(itemKey: string, quantity: number) {
  const nextQty = Math.max(1, quantity)
  const current = readCart()
  const next = current.map((item) =>
    getItemKey(item) === itemKey
      ? { ...item, quantity: nextQty, totalPrice: item.finalPrice * nextQty }
      : item,
  )
  writeCart(next)
  return next
}

export function removeLocalCartItem(itemKey: string) {
  const next = readCart().filter((item) => getItemKey(item) !== itemKey)
  writeCart(next)
  return next
}

export function clearLocalCart() {
  writeCart([])
}

export function getItemKey(item: LocalCartItem) {
  return `${item.productId}|${item.selectedSize ?? ''}|${item.selectedShoeSize ?? ''}|${item.selectedColor ?? ''}`
}

export function getLocalCartSummary(items: LocalCartItem[]): LocalCartSummary {
  const subtotal = items.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0)
  const grandTotal = items.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0)
  const discountTotal = subtotal - grandTotal
  return { subtotal, discountTotal, grandTotal }
}
