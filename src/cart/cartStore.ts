import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Product } from '../catalog/types'
import { cartLineKey } from './cartLine'

/** Bump if stored shape changes so old blobs are ignored. */
const CART_SESSION_KEY = 'modernsole-cart-v3'

export type CartItem = {
  product: Product
  quantity: number
  selectedSize?: string
  /** Shopify Storefront ProductVariant GID when catalog is from Shopify. */
  selectedVariantId?: string
}

type AddOptions = {
  selectedSize?: string
  selectedVariantId?: string
}

type CartState = {
  items: CartItem[]
  totalItems: number
  add(product: Product, quantity?: number, options?: AddOptions): void
  remove(productId: string, selectedSize?: string, selectedVariantId?: string): void
  setQuantity(productId: string, quantity: number, selectedSize?: string, selectedVariantId?: string): void
  clear(): void
}

function normalizeStoredRow(row: unknown): CartItem | null {
  if (!row || typeof row !== 'object') return null
  const r = row as Record<string, unknown>
  const q = r.quantity
  if (typeof q !== 'number' || !Number.isFinite(q) || q < 1) return null
  const p = r.product
  if (!p || typeof p !== 'object') return null
  const prod = p as Record<string, unknown>
  if (typeof prod.id !== 'string' || typeof prod.title !== 'string') return null
  const price = prod.price
  if (!price || typeof price !== 'object') return null
  const pr = price as Record<string, unknown>
  if (typeof pr.amount !== 'number') return null
  const c = pr.currency
  if (typeof c !== 'string' || !/^[A-Za-z]{3}$/.test(c.trim())) return null
  let selectedSize: string | undefined
  if (r.selectedSize !== undefined) {
    if (typeof r.selectedSize !== 'string') return null
    selectedSize = r.selectedSize
  }
  let selectedVariantId: string | undefined
  if (r.selectedVariantId !== undefined) {
    if (typeof r.selectedVariantId !== 'string') return null
    selectedVariantId = r.selectedVariantId
  }
  return {
    product: p as Product,
    quantity: Math.floor(q),
    ...(selectedSize !== undefined ? { selectedSize } : {}),
    ...(selectedVariantId !== undefined ? { selectedVariantId } : {}),
  }
}

function normalizeStoredItems(rows: unknown): CartItem[] {
  if (!Array.isArray(rows)) return []
  const out: CartItem[] = []
  for (const row of rows) {
    const item = normalizeStoredRow(row)
    if (item) out.push(item)
  }
  return out
}

function countItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      add(product: Product, quantity: number = 1, options?: AddOptions) {
        const selectedSize = options?.selectedSize
        const selectedVariantId =
          options?.selectedVariantId ??
          (selectedSize && product.shopifyVariantIdsBySize
            ? product.shopifyVariantIdsBySize[selectedSize]
            : undefined)

        set((state) => {
          const key = cartLineKey(product.id, selectedSize, selectedVariantId)
          const existing = state.items.find(
            (item) => cartLineKey(item.product.id, item.selectedSize, item.selectedVariantId) === key,
          )
          const items = !existing
            ? [...state.items, { product, quantity, selectedSize, selectedVariantId }]
            : state.items.map((item) =>
                cartLineKey(item.product.id, item.selectedSize, item.selectedVariantId) === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )

          return { items, totalItems: countItems(items) }
        })
      },
      remove(productId: string, selectedSize?: string, selectedVariantId?: string) {
        set((state) => {
          const key = cartLineKey(productId, selectedSize, selectedVariantId)
          const items = state.items.filter(
            (item) => cartLineKey(item.product.id, item.selectedSize, item.selectedVariantId) !== key,
          )
          return { items, totalItems: countItems(items) }
        })
      },
      setQuantity(
        productId: string,
        quantity: number,
        selectedSize?: string,
        selectedVariantId?: string,
      ) {
        set((state) => {
          const nextQty = Math.max(0, Math.floor(quantity))
          const key = cartLineKey(productId, selectedSize, selectedVariantId)
          const items =
            nextQty === 0
              ? state.items.filter(
                  (item) =>
                    cartLineKey(item.product.id, item.selectedSize, item.selectedVariantId) !== key,
                )
              : state.items.map((item) =>
                  cartLineKey(item.product.id, item.selectedSize, item.selectedVariantId) === key
                    ? { ...item, quantity: nextQty }
                    : item,
                )

          return { items, totalItems: countItems(items) }
        })
      },
      clear() {
        set({ items: [], totalItems: 0 })
      },
    }),
    {
      name: CART_SESSION_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const items = normalizeStoredItems((persistedState as { items?: unknown } | null)?.items)
        return {
          ...currentState,
          items,
          totalItems: countItems(items),
        }
      },
    },
  ),
)

export function useCart() {
  return useCartStore()
}
