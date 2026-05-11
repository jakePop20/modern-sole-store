import type { CartItem } from '../cart/cartStore'
import { storefrontGraphql, type StorefrontGraphqlResponse } from './shopifyStorefront'

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

type CartCreateData = {
  cartCreate: {
    cart: { checkoutUrl: string } | null
    userErrors: Array<{ field?: string[] | null; message: string }>
  } | null
}

export function resolveCartLineVariantId(item: CartItem): string | null {
  if (item.selectedVariantId) return item.selectedVariantId
  const sz = item.selectedSize
  if (sz && item.product.shopifyVariantIdsBySize?.[sz])
    return item.product.shopifyVariantIdsBySize[sz]
  return null
}

function mergeLinesByVariant(
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Array<{ merchandiseId: string; quantity: number }> {
  const map = new Map<string, number>()
  for (const l of lines) {
    map.set(l.merchandiseId, (map.get(l.merchandiseId) ?? 0) + l.quantity)
  }
  return [...map.entries()].map(([merchandiseId, quantity]) => ({ merchandiseId, quantity }))
}

function parseCartCreate(
  json: StorefrontGraphqlResponse<CartCreateData>,
): string {
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '))
  }
  const created = json.data?.cartCreate
  const userErrors = created?.userErrors ?? []
  if (userErrors.length) {
    throw new Error(userErrors.map((e) => e.message).join('; '))
  }
  const url = created?.cart?.checkoutUrl
  if (!url) throw new Error('Shopify did not return a checkout URL')
  return url
}

/**
 * Creates a Storefront cart via `/api/storefront` (OAuth token from client credentials)
 * and returns the hosted Shopify checkout URL.
 * Caller should redirect with `window.location.assign(url)`.
 */
export async function createShopifyCheckoutUrl(items: CartItem[]): Promise<string> {
  const lines: Array<{ merchandiseId: string; quantity: number }> = []
  for (const item of items) {
    const merchandiseId = resolveCartLineVariantId(item)
    if (!merchandiseId) {
      throw new Error(
        `Missing Shopify variant for “${item.product.title}”. Pick a size or use the live catalog.`,
      )
    }
    lines.push({ merchandiseId, quantity: item.quantity })
  }
  const merged = mergeLinesByVariant(lines)

  const res = await storefrontGraphql<CartCreateData>(CART_CREATE_MUTATION, {
    input: { lines: merged },
  })
  return parseCartCreate(res)
}
