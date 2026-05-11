import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { normalizeProductGallery } from '../catalog/gallery'
import type { Product } from '../catalog/types'
import {
  DEFAULT_DETAIL_ACCORDIONS,
  DEFAULT_REVIEWS,
  DEFAULT_TECH_SPECS,
} from '../catalog/detailDefaults'
import { catalog } from '../catalog/catalog'
import { formatMoney } from '../lib/formatMoney'
import { useCart } from '../cart/cartStore'
import styles from './ProductDetailsPage.module.css'

const PDP_GRID_SIZES = ['7', '8', '9', '10', '11', '12', '13', '14'] as const

function sizeIsAvailable(product: Product, size: string): boolean {
  if (product.inStock === false) return false
  if (product.sizeTags?.length && !product.sizeTags.includes(size)) return false
  if (product.pdpSizesDisabled?.includes(size)) return false
  return true
}

function firstAvailableSize(product: Product): string | null {
  for (const s of PDP_GRID_SIZES) {
    if (sizeIsAvailable(product, s)) return s
  }
  return null
}

function resolveDefaultSize(product: Product): string | null {
  const pref = product.defaultSizeUs
  if (pref && sizeIsAvailable(product, pref)) return pref
  return firstAvailableSize(product)
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className={styles.stars} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="material-symbols-outlined"
          style={{
            fontVariationSettings:
              i < rating ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400",
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}

export function ProductDetailsPage() {
  const cart = useCart()
  const { productId } = useParams()

  const [product, setProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'not_found' | 'error'>(
    'loading',
  )
  const [mainIndex, setMainIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!productId) {
        setStatus('not_found')
        return
      }
      setStatus('loading')
      try {
        const p = await catalog.getProductById(productId)
        if (cancelled) return
        if (!p) {
          setProduct(null)
          setStatus('not_found')
          return
        }
        setProduct(p)
        setMainIndex(0)
        setStatus('ready')
      } catch {
        if (cancelled) return
        setStatus('error')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [productId])

  useEffect(() => {
    if (!product) return
    setSelectedSize(resolveDefaultSize(product))
  }, [product])

  const gallery = useMemo(() => (product ? normalizeProductGallery(product.images) : []), [product])

  const heroBadge = useMemo(() => {
    if (!product) return null
    if (product.detailBadge) return product.detailBadge
    if (product.listingBadge?.kind === 'new_release') {
      return {
        label: product.listingBadge.label ?? 'Limited Drop',
        variant: 'secondary' as const,
      }
    }
    return null
  }, [product])

  /** Per-size inventory when `stockQuantityBySize` is present (Shopify); else mock aggregates. */
  const stockUi = useMemo(() => {
    if (!product || product.inStock === false) return null
    const map = product.stockQuantityBySize
    if (map) {
      if (!selectedSize)
        return { promptSelectSize: true as const, label: '', pct: 0 }
      const q = map[selectedSize]
      if (q === undefined)
        return { promptSelectSize: false as const, label: '—', pct: 0 }
      if (q === null)
        return { promptSelectSize: false as const, label: 'In stock', pct: 38 }
      if (q <= 0)
        return { promptSelectSize: false as const, label: '0 LEFT', pct: 0 }
      const pct = Math.min(100, Math.max(8, Math.round((q / 40) * 100)))
      return { promptSelectSize: false as const, label: `${q} LEFT`, pct }
    }
    const qty = product.stockRemaining ?? 12
    const pct = product.stockFillPercent ?? 25
    return { promptSelectSize: false as const, label: `${qty} LEFT`, pct }
  }, [product, selectedSize])

  const specs = product?.specCards ?? DEFAULT_TECH_SPECS
  const reviews = product?.reviews ?? DEFAULT_REVIEWS
  const reviewSummary = product?.reviewsSummary ?? { average: '4.9', count: 124 }
  const accordions = product?.detailAccordions ?? DEFAULT_DETAIL_ACCORDIONS

  const toggleAccordion = useCallback((id: string) => {
    setOpenAccordion((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const accordionHeading = useCallback(
    (id: string, title: string) => {
      if (id === 'reviews') return `Customer Reviews (${reviewSummary.count})`
      return title
    },
    [reviewSummary.count],
  )

  if (status === 'loading') {
    return (
      <div className={styles.skeleton}>
        <div className={styles.skeletonBox}>Loading product…</div>
      </div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className={styles.errorWrap}>
        <h1 className={styles.title}>Product not found</h1>
        <p className={styles.desc}>The product you’re looking for doesn’t exist.</p>
        <Link to="/products" className={styles.back}>
          ← Shop All
        </Link>
      </div>
    )
  }

  if (status === 'error' || !product) {
    return (
      <div className={styles.errorWrap}>
        <div className={styles.alert}>Failed to load product.</div>
        <Link to="/products" className={styles.back}>
          ← Shop All
        </Link>
      </div>
    )
  }

  const inStock = product.inStock !== false
  const mainImg = gallery[mainIndex]

  const specIconClass = (i: number) =>
    [styles.specIconPrimary, styles.specIconSecondary, styles.specIconTertiary][i % 3]

  return (
    <div className={styles.root}>
      <Link to="/products" className={styles.back}>
        ← Shop All
      </Link>

      <div className={styles.grid}>
        <section className={styles.gallery} aria-label="Product gallery">
          <div className={styles.mainShot}>
            {mainImg?.src ? (
              <img
                className={styles.mainShotImg}
                src={mainImg.src}
                alt={mainImg.alt}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.skeletonBox} style={{ height: '100%', border: 'none' }}>
                No image
              </div>
            )}
            {product.listingBadge?.kind === 'sold_out' ? (
              <span className={`${styles.galleryBadge} ${styles.badgeSold}`}>
                {product.listingBadge.label ?? 'Sold Out'}
              </span>
            ) : heroBadge ? (
              <span className={`${styles.galleryBadge} ${styles.badgeSecondary}`}>
                {heroBadge.label}
              </span>
            ) : null}
          </div>
          <div className={styles.thumbGrid}>
            {gallery.slice(1).map((img, i) => {
              const gi = i + 1
              return (
                <button
                  key={`${gi}-${img.src}`}
                  type="button"
                  className={`${styles.thumb} ${gi === mainIndex ? styles.thumbActive : ''}`}
                  onClick={() => setMainIndex(gi)}
                  aria-label={`View image ${gi + 1}`}
                >
                  {img.src ? (
                    <img src={img.src} alt="" referrerPolicy="no-referrer" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </section>

        <section className={styles.panel} aria-label="Product details">
          <div>
            <h1 className={styles.title}>{product.title}</h1>
            <p className={styles.price}>
              {formatMoney(product.price.amount, product.price.currency)}
            </p>
          </div>

          {product.variantLine ? (
            <p className={styles.desc} style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
              {product.variantLine}
            </p>
          ) : null}

          <p className={styles.desc}>{product.description}</p>

          <div>
            <div className={styles.sizeHeader}>
              <span className={styles.sizeLabel}>Select Size (US)</span>
              <button type="button" className={styles.sizeGuideBtn}>
                Size Guide
              </button>
            </div>
            <div className={styles.sizeGrid}>
              {PDP_GRID_SIZES.map((size) => {
                const avail = sizeIsAvailable(product, size)
                const selected = selectedSize === size
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!avail}
                    className={`${styles.sizeCell} ${selected ? styles.sizeCellActive : ''} ${!avail ? styles.sizeCellDisabled : ''}`}
                    onClick={() => avail && setSelectedSize(size)}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {inStock ? (
            <button
              type="button"
              className={styles.addBtn}
              disabled={!selectedSize}
              onClick={() =>
                selectedSize && cart.add(product, 1, { selectedSize })
              }
            >
              Add to Drop <span className="material-symbols-outlined">bolt</span>
            </button>
          ) : (
            <button type="button" className={styles.addBtn} disabled>
              Out of Stock
            </button>
          )}

          {inStock && stockUi ? (
            <div className={styles.stockBlock}>
              <div className={styles.stockRow}>
                <span>Stock Level</span>
                <span>
                  {stockUi.promptSelectSize ? 'Select a size' : stockUi.label}
                </span>
              </div>
              {!stockUi.promptSelectSize ? (
                <div className={styles.stockTrack} aria-hidden>
                  <div
                    className={styles.stockFill}
                    style={{
                      width: `${Math.min(100, Math.max(0, stockUi.pct))}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={styles.accordion}>
            {accordions.map((row) => (
              <div key={row.id} className={styles.accRow}>
                <button
                  type="button"
                  className={styles.accTrigger}
                  onClick={() => toggleAccordion(row.id)}
                  aria-expanded={openAccordion[row.id] ?? false}
                >
                  {accordionHeading(row.id, row.title)}
                  <span className={`material-symbols-outlined ${styles.accIcon}`}>
                    {openAccordion[row.id] ? 'remove' : 'add'}
                  </span>
                </button>
                {openAccordion[row.id] ? (
                  <div className={styles.accPanel}>{row.body}</div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.blueprint} aria-labelledby="blueprint-title">
        <div className={styles.blueprintInner}>
          <h2 id="blueprint-title" className={styles.blueprintTitle}>
            Technical Blueprint
          </h2>
          <div className={styles.specGrid}>
            {specs.map((card, i) => (
              <div key={`${card.title}-${i}`} className={styles.specCard}>
                <span className={`material-symbols-outlined ${styles.specCardIcon} ${specIconClass(i)}`}>
                  {card.icon}
                </span>
                <h3 className={styles.specCardTitle}>{card.title}</h3>
                <p className={styles.specCardBody}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.feed} aria-labelledby="feed-title">
        <div className={styles.feedInner}>
          <div className={styles.feedHead}>
            <h2 id="feed-title" className={styles.feedTitle}>
              Recent Feed
            </h2>
            <span className={styles.feedRating}>
              {reviewSummary.average} / 5.0 RATING
            </span>
          </div>
          <div className={styles.feedGrid}>
            {reviews.map((rv) => (
              <article key={rv.author} className={styles.reviewCard}>
                <div className={styles.reviewTop}>
                  <span className={styles.reviewAuthor}>{rv.author}</span>
                  <StarRow rating={rv.rating} />
                </div>
                <p className={styles.reviewBody}>&quot;{rv.body}&quot;</p>
              </article>
            ))}
          </div>
          <button type="button" className={styles.viewReviews}>
            View All Reviews
          </button>
        </div>
      </section>
    </div>
  )
}
