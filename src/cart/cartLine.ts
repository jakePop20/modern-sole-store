/**
 * Stable key for merging cart lines. When `selectedVariantId` is set (Shopify
 * ProductVariant GID), it is the canonical key so lines stay unique per variant.
 */
export function cartLineKey(
  productId: string,
  selectedSize?: string,
  selectedVariantId?: string,
) {
  if (selectedVariantId) return `v::${selectedVariantId}`
  return `${productId}::${selectedSize ?? ''}`
}
