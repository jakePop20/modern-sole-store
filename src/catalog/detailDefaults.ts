import type { ProductDetailAccordion, ProductReview, ProductSpecCard } from './types'

export const DEFAULT_TECH_SPECS: ProductSpecCard[] = [
  {
    icon: 'architecture',
    title: 'Material Stack',
    description:
      'Triple-layer ballistic mesh with synthetic suede overlays and high-frequency welded TPU support ribs.',
  },
  {
    icon: 'energy_savings_leaf',
    title: 'Eco Impact',
    description:
      'Outsole made from 20% recycled ocean plastics. Zero-waste pattern cutting reduces textile scrap by 15%.',
  },
  {
    icon: 'layers',
    title: 'Kinetic Sole',
    description:
      'Dual-density EVA foam midsole provides responsive cushioning that adapts to your walking gait in real-time.',
  },
]

export const DEFAULT_REVIEWS: ProductReview[] = [
  {
    author: 'ARC_TYPE_99',
    rating: 5,
    body:
      'Best drop this year. The structure is incredibly rigid yet the cushioning is surprisingly plush. A true brutalist masterpiece for the feet.',
  },
  {
    author: 'NEO_WALKER',
    rating: 4,
    body:
      'Fits true to size. The materials feel like they’re from 2050. Highly recommend for anyone looking for that unique silhouette.',
  },
]

export const DEFAULT_DETAIL_ACCORDIONS: ProductDetailAccordion[] = [
  {
    id: 'specs',
    title: 'Product Specs',
    body:
      'Engineered knit upper with locked-in lateral support zones. Lightweight shank maintains torsion control through pavement cuts and stair drops.',
  },
  {
    id: 'reviews',
    title: 'Customer Reviews',
    body:
      'Average rating aggregates verified purchases from the ARCHIVE storefront. Ratings reflect comfort, silhouette, and long-term durability after 120 days of urban wear trials.',
  },
  {
    id: 'shipping',
    title: 'Shipping & Returns',
    body:
      'Domestic shipments dispatch within two business days. Returns accepted within thirty days provided tags remain intact—footwear must show no pavement wear.',
  },
]
