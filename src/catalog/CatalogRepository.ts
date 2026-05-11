import type { Product } from './types'

export type ListProductsInput = {
  query?: string
  tag?: string
  styles?: string[]
  sizes?: string[]
  colors?: string[]
}

export type CatalogRepository = {
  listProducts(input?: ListProductsInput): Promise<Product[]>
  getProductById(id: string): Promise<Product | null>
}

