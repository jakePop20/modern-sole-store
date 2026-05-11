#!/usr/bin/env node
import { exchangeShopifyClientCredentials } from './shopifyClientCredentials.mjs'

try {
  const data = await exchangeShopifyClientCredentials()
  const { access_token: _omit, ...rest } = data
  console.log(JSON.stringify({ ...rest, access_token: '[redacted — use in server only]' }, null, 2))
  console.error('\nToken length:', data.access_token?.length ?? 0, '(printed redacted above)')
} catch (e) {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
}
