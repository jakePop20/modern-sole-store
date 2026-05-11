import type { IncomingMessage } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
// ESM helper is plain .mjs; no .ts wrapper to avoid duplicating logic.
// @ts-expect-error -- module has no typedef; implementation is server/shopifyClientCredentials.mjs
import { clearShopifyTokenCache, getCachedShopifyAccessToken } from './server/shopifyClientCredentials.mjs'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function normalizeShopHost(raw: string | undefined): string {
  const s = String(raw ?? '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
  return s || 'storefront-api-m8i5h3yi.myshopify.com'
}

/**
 * Dev-only: POST /api/storefront with { query, variables? } → Shopify Storefront GraphQL.
 * Keeps the OAuth access token on the server. Does not run in `vite preview` or static deploys.
 */
function shopifyStorefrontProxy(env: Record<string, string>): Plugin {
  const shop = normalizeShopHost(
    env.SHOPIFY_SHOP_DOMAIN || env.VITE_SHOPIFY_SHOP_DOMAIN,
  )
  const version = env.SHOPIFY_STOREFRONT_API_VERSION || '2025-01'

  return {
    name: 'shopify-storefront-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== '/api/storefront' || req.method !== 'POST') {
          next()
          return
        }

        try {
          const raw = await readBody(req)
          let body: { query?: string; variables?: unknown }
          try {
            body = JSON.parse(raw || '{}') as { query?: string; variables?: unknown }
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ errors: [{ message: 'Invalid JSON body' }] }))
            return
          }

          if (!body.query || typeof body.query !== 'string') {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ errors: [{ message: 'Missing query string' }] }))
            return
          }

          const url = `https://${shop}/api/${version}/graphql.json`
          const variables =
            body.variables !== undefined &&
            body.variables !== null &&
            typeof body.variables === 'object' &&
            !Array.isArray(body.variables)
              ? body.variables
              : {}

          const xff = req.headers['x-forwarded-for']
          const xffFirst =
            typeof xff === 'string'
              ? xff.split(',')[0]?.trim()
              : Array.isArray(xff)
                ? xff[0]?.split(',')[0]?.trim()
                : undefined
          const buyerIp = xffFirst || req.socket.remoteAddress || ''

          async function storefrontFetch(accessToken: string) {
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              // OAuth / delegate tokens from client_credentials use the *private* header (server-side).
              // X-Shopify-Storefront-Access-Token is for public storefront tokens only.
              // https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api
              'Shopify-Storefront-Private-Token': accessToken,
            }
            if (buyerIp) headers['Shopify-Storefront-Buyer-IP'] = buyerIp

            return fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify({ query: body.query, variables }),
            })
          }

          // 1) OAuth client_credentials → access_token (cached in shopifyClientCredentials.mjs)
          let token = await getCachedShopifyAccessToken()
          let shopifyRes = await storefrontFetch(token)

          // 2) On 401, clear cache, get a fresh token from /admin/oauth/access_token, retry once
          if (shopifyRes.status === 401) {
            clearShopifyTokenCache()
            token = await getCachedShopifyAccessToken()
            shopifyRes = await storefrontFetch(token)
          }

          const text = await shopifyRes.text()
          res.statusCode = shopifyRes.status
          const ct = shopifyRes.headers.get('content-type')
          if (ct) res.setHeader('Content-Type', ct)
          else res.setHeader('Content-Type', 'application/json')
          res.end(text)
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              errors: [{ message: e instanceof Error ? e.message : String(e) }],
            }),
          )
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), shopifyStorefrontProxy(env)],
  }
})
