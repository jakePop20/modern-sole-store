/**
 * Server-side Shopify OAuth client credentials exchange.
 *
 * Docs: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant
 *
 * Shopify’s documented request uses application/x-www-form-urlencoded (not JSON).
 * Never import this from browser code — client_secret must stay on the server.
 *
 * Note: This returns an Admin API access token for GraphQL Admin API, not the
 * Storefront API public token. Use Headless storefront tokens for Storefront API,
 * or Admin API as appropriate for your integration.
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** @type {{ token: string; expiresAt: number } | null} */
let tokenCache = null

function loadDotEnv(filePath = resolve(process.cwd(), '.env')) {
  if (!existsSync(filePath)) return
  const text = readFileSync(filePath, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (key) process.env[key] = val
  }
}

function normalizeShopHost(raw) {
  let s = String(raw || '').trim()
  if (!s) return 'storefront-api-m8i5h3yi.myshopify.com'
  s = s.replace(/^https?:\/\//i, '').split('/')[0] || ''
  return s || 'storefront-api-m8i5h3yi.myshopify.com'
}

/**
 * @returns {Promise<{ access_token: string; scope?: string; expires_in?: number }>}
 */
export async function exchangeShopifyClientCredentials() {
  loadDotEnv()

  const shop = normalizeShopHost(
    process.env.SHOPIFY_SHOP_DOMAIN || process.env.VITE_SHOPIFY_SHOP_DOMAIN,
  )
  const clientId = (process.env.SHOPIFY_CLIENT_ID || process.env.CLIENT_ID || '').trim()
  const clientSecret = (
    process.env.SHOPIFY_CLIENT_SECRET ||
    process.env.CLIENT_SECRET ||
    ''
  ).trim()

  if (!clientId || !clientSecret) {
    throw new Error(
      'Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET (or CLIENT_ID / CLIENT_SECRET) in .env',
    )
  }

  const url = `https://${shop}/admin/oauth/access_token`

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Shopify token exchange failed (${res.status}): ${text}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Shopify token exchange: invalid JSON: ${text.slice(0, 200)}`)
  }
}

/**
 * Caches the token until shortly before expires_in (default ~24h per Shopify).
 * @returns {Promise<string>}
 */
export async function getCachedShopifyAccessToken() {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.token

  const data = await exchangeShopifyClientCredentials()
  const token = data.access_token
  if (!token || typeof token !== 'string') {
    throw new Error('Shopify token response missing access_token')
  }

  const expiresIn =
    typeof data.expires_in === 'number' && Number.isFinite(data.expires_in)
      ? data.expires_in
      : 86399

  tokenCache = {
    token,
    expiresAt: now + expiresIn * 1000,
  }

  return token
}

/** Clear cached token (e.g. after 401 so the next call re-hits /admin/oauth/access_token). */
export function clearShopifyTokenCache() {
  tokenCache = null
}
