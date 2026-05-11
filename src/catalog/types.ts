export type Money = {
  /** ISO 4217 code from Shopify (e.g. USD, MXN, EUR). */
  currency: string
  amount: number
}

export type ProductDetailBadge = {
  label: string
  /** 'secondary' = lilac chip like the design reference */
  variant?: 'secondary'
}

export type ProductSpecCard = {
  icon: string
  title: string
  description: string
}

export type ProductReview = {
  author: string
  rating: number
  body: string
}

export type ProductDetailAccordion = {
  id: string
  title: string
  body: string
}


export type ProductImage = {
  src: string
  alt: string
  width?: number
  height?: number
}

/** Platter / listing card theme (maps to footer colors on the grid). */
export type ProductListingTone =
  | 'tertiaryFixedDim'
  | 'secondaryFixedDim'
  | 'surfaceHighest'
  | 'primaryFixed'
  | 'tertiaryFixed'
  | 'surfaceHigh'

export type ProductListingBadge =
  | { kind: 'new_release'; label?: string }
  | { kind: 'sold_out'; label?: string }

export type Product = {
  id: string
  slug: string
  title: string
  description: string
  price: Money
  images: ProductImage[]
  tags?: string[]
  /** One-liner under the title on listing cards, e.g. "Cyber / Orange". */
  variantLine?: string
  /** US size → subtitle for that variant (Shopify), e.g. "Orange / 9". */
  variantLineBySize?: Record<string, string>
  /** Listing card footer palette. */
  listingTone?: ProductListingTone
  listingBadge?: ProductListingBadge
  /** Default in stock when omitted. */
  inStock?: boolean
  /** Facets for mock filters (swap for CMS fields later). */
  styleTags?: string[]
  sizeTags?: string[]
  colorTags?: string[]
  /** PDP hero chip above gallery (e.g. Limited Drop). */
  detailBadge?: ProductDetailBadge
  /** Sizes not purchasable on PDP (shown disabled). */
  pdpSizesDisabled?: string[]
  /** Default selected size in US; falls back to first purchasable. */
  defaultSizeUs?: string | null
  /** Remaining units for mock stock meter (fallback when no per-size data). */
  stockRemaining?: number
  /** Fill width for stock bar (0–100) — fallback when no per-size data. */
  stockFillPercent?: number
  /** US size → units available (Shopify); `null` means inventory not exposed / unknown. */
  stockQuantityBySize?: Record<string, number | null>
  /** Technical blueprint cards; falls back to shared mock copy in UI if absent. */
  specCards?: ProductSpecCard[]
  /** Review cards; optional overrides. */
  reviews?: ProductReview[]
  reviewsSummary?: { average: string; count: number }
  /** Collapsible rows below add-to-cart + default shipping copy. */
  detailAccordions?: ProductDetailAccordion[]
  /** US size → Storefront ProductVariant GID (cart / checkout). */
  shopifyVariantIdsBySize?: Record<string, string>
}
