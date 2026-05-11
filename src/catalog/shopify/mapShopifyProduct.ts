import type { Product, ProductImage, ProductListingTone } from '../types'

const LISTING_TONES: ProductListingTone[] = [
  'tertiaryFixedDim',
  'secondaryFixedDim',
  'surfaceHighest',
  'primaryFixed',
  'tertiaryFixed',
  'surfaceHigh',
]

type ShopifyMoney = { amount: string; currencyCode: string }

type ShopifyVariantNode = {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable?: number | null
  selectedOptions: { name: string; value: string }[]
  price: ShopifyMoney
}

type ShopifyImageNode = {
  url: string
  altText?: string | null
  width?: number | null
  height?: number | null
}

export type ShopifyProductNode = {
  id: string
  handle: string
  title: string
  description?: string | null
  tags?: string[]
  featuredImage?: ShopifyImageNode | null
  images?: {
    edges: Array<{ node: ShopifyImageNode }>
  }
  priceRange?: {
    minVariantPrice: ShopifyMoney
  }
  variants: {
    edges: Array<{ node: ShopifyVariantNode }>
  }
}

/** Normalize Shopify `currencyCode` to ISO 4217 uppercase. */
function mapCurrency(code: string): string {
  const c = code.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(c) ? c : 'USD'
}

function parseAmount(amount: string): number {
  const n = Number.parseFloat(amount)
  return Number.isFinite(n) ? n : 0
}

/** Matches Storefront option names like `Shoe size`, `Size`. */
function isSizeOptionName(name: string): boolean {
  const n = name.trim().toLowerCase()
  return n === 'size' || n.endsWith('size') || n.includes('shoe size')
}

function variantSize(v: ShopifyVariantNode): string | null {
  const opt = v.selectedOptions.find((o) => isSizeOptionName(o.name))
  const raw = opt?.value?.trim()
  if (raw) return raw

  // Title shapes: "7 / Orange", "White / 7", "Green / 12"
  const parts = v.title.split('/').map((s) => s.trim())
  if (parts.length >= 2) {
    if (/^\d+(\.\d+)?$/.test(parts[0]!)) return parts[0]!
    if (/^\d+(\.\d+)?$/.test(parts[1]!)) return parts[1]!
  }
  if (parts.length >= 1 && /^\d+(\.\d+)?$/.test(parts[0]!)) return parts[0]!
  return null
}

function variantColor(v: ShopifyVariantNode): string | null {
  const opt = v.selectedOptions.find((o) => {
    const n = o.name.trim().toLowerCase()
    return n === 'color' || n === 'colour'
  })
  return opt?.value?.trim() ?? null
}

/** Map Shopify color names to PLP filter ids (`colorTags`). */
function shopifyColorToFilterTag(color: string): string | null {
  const c = color.trim().toLowerCase()
  const map: Record<string, string> = {
    black: 'black',
    white: 'light',
    orange: 'coral',
    green: 'lime',
  }
  return map[c] ?? null
}

function collectImages(node: ShopifyProductNode): ProductImage[] {
  const seen = new Set<string>()
  const out: ProductImage[] = []

  const push = (img: ShopifyImageNode | null | undefined) => {
    if (!img?.url || seen.has(img.url)) return
    seen.add(img.url)
    out.push({
      src: img.url,
      alt: img.altText || node.title,
      width: img.width ?? undefined,
      height: img.height ?? undefined,
    })
  }

  push(node.featuredImage)
  for (const e of node.images?.edges ?? []) push(e.node)

  return out
}

function hashToneIndex(handle: string): number {
  let h = 0
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) | 0
  return Math.abs(h) % LISTING_TONES.length
}

/** Map Storefront `Product` node → app `Product` (listing + PDP). */
export function mapShopifyProductNode(node: ShopifyProductNode, listIndex = 0): Product {
  const variants = node.variants.edges.map((e) => e.node)
  const shopifyVariantIdsBySize: Record<string, string> = {}
  const stockQuantityBySize: Record<string, number | null> = {}
  const variantLineBySize: Record<string, string> = {}
  const sizes: string[] = []
  const colors = new Set<string>()

  const pdpSizesDisabled: string[] = []

  for (const v of variants) {
    const size = variantSize(v)
    const col = variantColor(v)
    if (size) {
      sizes.push(size)
      shopifyVariantIdsBySize[size] = v.id
      stockQuantityBySize[size] =
        typeof v.quantityAvailable === 'number' ? v.quantityAvailable : null
      variantLineBySize[size] = [col, size].filter(Boolean).join(' / ')
      const oos =
        !v.availableForSale ||
        (v.quantityAvailable != null && v.quantityAvailable <= 0)
      if (oos) pdpSizesDisabled.push(size)
    }
    if (col) {
      const tag = shopifyColorToFilterTag(col)
      if (tag) colors.add(tag)
    }
  }

  const uniqueSizes = [...new Set(sizes)].sort((a, b) => Number(a) - Number(b))

  let minAmount = node.priceRange
    ? parseAmount(node.priceRange.minVariantPrice.amount)
    : Number.POSITIVE_INFINITY
  let minCurrency = node.priceRange?.minVariantPrice.currencyCode ?? 'USD'
  for (const v of variants) {
    const a = parseAmount(v.price.amount)
    if (a < minAmount) {
      minAmount = a
      minCurrency = v.price.currencyCode
    }
  }
  if (!Number.isFinite(minAmount)) minAmount = 0

  const anyAvailable = variants.some(
    (v) => v.availableForSale && (v.quantityAvailable == null || v.quantityAvailable > 0),
  )
  const qtySum = variants.reduce((s, v) => {
    const q = v.quantityAvailable
    return s + (typeof q === 'number' && q > 0 ? q : 0)
  }, 0)

  const firstVariant = variants[0]
  const variantLine =
    firstVariant &&
    [variantColor(firstVariant), variantSize(firstVariant)].filter(Boolean).join(' / ')

  const colorTagsFiltered = [...colors]

  return {
    id: node.id,
    slug: node.handle,
    title: node.title,
    description: node.description?.trim() || '',
    price: { currency: mapCurrency(minCurrency), amount: minAmount },
    images: collectImages(node),
    tags: node.tags && node.tags.length ? node.tags : undefined,
    variantLine: variantLine || undefined,
    variantLineBySize:
      Object.keys(variantLineBySize).length > 0 ? variantLineBySize : undefined,
    listingTone: LISTING_TONES[hashToneIndex(node.handle + listIndex)],
    listingBadge: anyAvailable ? undefined : { kind: 'sold_out', label: 'Sold Out' },
    inStock: anyAvailable,
    sizeTags: uniqueSizes.length ? uniqueSizes : undefined,
    colorTags: colorTagsFiltered.length ? colorTagsFiltered : undefined,
    pdpSizesDisabled: pdpSizesDisabled.length
      ? [...new Set(pdpSizesDisabled)]
      : undefined,
    defaultSizeUs: uniqueSizes.find((s) =>
      variants.some(
        (v) =>
          variantSize(v) === s &&
          v.availableForSale &&
          (v.quantityAvailable == null || v.quantityAvailable > 0),
      ),
    ) ?? uniqueSizes[0] ?? null,
    stockRemaining: qtySum > 0 ? qtySum : anyAvailable ? undefined : 0,
    stockFillPercent:
      qtySum > 0 ? Math.min(100, Math.max(8, Math.round((qtySum / 40) * 100))) : anyAvailable ? 30 : 0,
    stockQuantityBySize:
      Object.keys(stockQuantityBySize).length > 0 ? stockQuantityBySize : undefined,
    shopifyVariantIdsBySize:
      Object.keys(shopifyVariantIdsBySize).length > 0 ? shopifyVariantIdsBySize : undefined,
  }
}
