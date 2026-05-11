import { storefrontGraphql } from '../../lib/shopifyStorefront'
import type { ListProductsInput } from '../CatalogRepository'
import type { Product } from '../types'
import { mapShopifyProductNode, type ShopifyProductNode } from './mapShopifyProduct'
import { CATALOG_PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from './queries'

type CatalogProductsData = {
  products: {
    edges: Array<{ node: ShopifyProductNode }>
  }
}

type ProductByHandleData = {
  productByHandle: ShopifyProductNode | null
}

export function isShopifyCatalogEnabled(): boolean {
  return import.meta.env.DEV
}

export async function shopifyListProducts(_input?: ListProductsInput): Promise<Product[]> {
  const res = await storefrontGraphql<CatalogProductsData>(CATALOG_PRODUCTS_QUERY, {
    first: 48,
  })
  if (res.errors?.length) {
    throw new Error(res.errors.map((e) => e.message).join('; '))
  }
  const edges = res.data?.products?.edges ?? []
  return edges.map((e, i) => mapShopifyProductNode(e.node, i))
}

export async function shopifyGetProductByHandle(handle: string): Promise<Product | null> {
  const res = await storefrontGraphql<ProductByHandleData>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  })
  if (res.errors?.length) {
    throw new Error(res.errors.map((e) => e.message).join('; '))
  }
  const node = res.data?.productByHandle
  if (!node) return null
  return mapShopifyProductNode(node, 0)
}
