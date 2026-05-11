/**
 * Storefront GraphQL via `POST /api/storefront`.
 * The Vite dev server proxies to Shopify with `Shopify-Storefront-Private-Token`
 * (OAuth access_token from client_credentials — see `server/shopifyClientCredentials.mjs`).
 * Production hosts must expose the same proxy path (e.g. serverless).
 */

const STOREFRONT_PROXY = '/api/storefront'

export type StorefrontGraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

export async function storefrontGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<StorefrontGraphqlResponse<T>> {
  const res = await fetch(STOREFRONT_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: variables ?? {} }),
  })

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text) as StorefrontGraphqlResponse<T>
  } catch {
    throw new Error(`storefrontGraphql: ${res.status} non-JSON: ${text.slice(0, 200)}`)
  }

  if (!res.ok) {
    const msg =
      (json as StorefrontGraphqlResponse<T>).errors?.[0]?.message ?? text.slice(0, 200)
    throw new Error(`storefrontGraphql: ${res.status} ${msg}`)
  }

  return json as StorefrontGraphqlResponse<T>
}

/** Minimal query to verify the dev proxy and token (Shopify Storefront API). */
export const STOREFRONT_PING_QUERY = `#graphql
  query ShopPing {
    shop {
      name
    }
  }
`
