import type { CatalogRepository } from './CatalogRepository'
import { mockGetProductById, mockListProducts } from './mock/mockCatalog'
import {
  isShopifyCatalogEnabled,
  shopifyGetProductByHandle,
  shopifyListProducts,
} from './shopify/shopifyCatalog'

function applyListingFilters<
  T extends {
    title: string
    variantLine?: string
    styleTags?: string[]
    sizeTags?: string[]
    colorTags?: string[]
    /** Sizes shown disabled on PDP (OOS) — excluded when filtering by that size. */
    pdpSizesDisabled?: string[]
  },
>(
  items: T[],
  input?: { query?: string; styles?: string[]; sizes?: string[]; colors?: string[] },
): T[] {
  let next = items
  const q = input?.query?.trim().toLowerCase()
  if (q) {
    next = next.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.variantLine?.toLowerCase().includes(q) ?? false),
    )
  }
  const styles = input?.styles?.filter(Boolean)
  if (styles?.length) {
    next = next.filter(
      (p) => p.styleTags?.length && p.styleTags.some((s) => styles.includes(s)),
    )
  }
  const sizes = input?.sizes?.filter(Boolean)
  if (sizes?.length) {
    next = next.filter((p) =>
      sizes.some((sz) => {
        if (!p.sizeTags?.includes(sz)) return false
        if (p.pdpSizesDisabled?.includes(sz)) return false
        return true
      }),
    )
  }
  const colors = input?.colors?.filter(Boolean)
  if (colors?.length) {
    next = next.filter(
      (p) => p.colorTags?.length && p.colorTags.some((c) => colors.includes(c)),
    )
  }
  return next
}

async function listProductsImpl(input?: Parameters<CatalogRepository['listProducts']>[0]) {
  if (isShopifyCatalogEnabled()) {
    const items = await shopifyListProducts(input)
    return applyListingFilters(items, input)
  }
  const items = await mockListProducts()
  return applyListingFilters(items, input)
}

async function getProductByIdImpl(id: string) {
  if (isShopifyCatalogEnabled()) {
    return shopifyGetProductByHandle(id)
  }
  return mockGetProductById(id)
}

export const catalog: CatalogRepository = {
  listProducts: listProductsImpl,
  getProductById: getProductByIdImpl,
}

