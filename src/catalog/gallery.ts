import type { ProductImage } from './types'

/** PDP shows main + two thumbnails — pad shorter arrays with sensible fallbacks. */
export function normalizeProductGallery(images: ProductImage[]): ProductImage[] {
  if (!images.length) {
    return [
      { src: '', alt: 'Product image unavailable' },
      { src: '', alt: '' },
      { src: '', alt: '' },
    ]
  }
  if (images.length >= 3) return images.slice(0, 3)
  const a = images[0]!
  const b = images[1] ?? { ...a, alt: `${a.alt} — detail view` }
  const c =
    images[2] ??
    images[1] ??
    ({
      ...a,
      alt: `${a.alt} — alternate`,
    })
  return [a, b, c]
}
