import { clearShopifyTokenCache, getCachedShopifyAccessToken } from '../server/shopifyClientCredentials.mjs'

function normalizeShopHost(raw) {
  const s = String(raw ?? '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
  return s || 'storefront-api-m8i5h3yi.myshopify.com'
}

async function readBody(req) {
  if (typeof req.body === 'string') return req.body
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body)

  return await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ errors: [{ message: 'Method not allowed' }] }))
    return
  }

  try {
    const raw = await readBody(req)
    let body
    try {
      body = JSON.parse(raw || '{}')
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

    const shop = normalizeShopHost(
      process.env.SHOPIFY_SHOP_DOMAIN || process.env.VITE_SHOPIFY_SHOP_DOMAIN,
    )
    const version = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2025-01'
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
    const buyerIp = xffFirst || req.socket?.remoteAddress || ''

    async function storefrontFetch(accessToken) {
      const headers = {
        'Content-Type': 'application/json',
        'Shopify-Storefront-Private-Token': accessToken,
      }
      if (buyerIp) headers['Shopify-Storefront-Buyer-IP'] = buyerIp

      return fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: body.query, variables }),
      })
    }

    let token = await getCachedShopifyAccessToken()
    let shopifyRes = await storefrontFetch(token)

    if (shopifyRes.status === 401) {
      clearShopifyTokenCache()
      token = await getCachedShopifyAccessToken()
      shopifyRes = await storefrontFetch(token)
    }

    const text = await shopifyRes.text()
    res.statusCode = shopifyRes.status
    const ct = shopifyRes.headers.get('content-type')
    res.setHeader('Content-Type', ct || 'application/json')
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
}
