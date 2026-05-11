import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { catalog } from '../catalog/catalog'
import { formatMoney } from '../lib/formatMoney'
import type { Product, ProductListingTone } from '../catalog/types'
import { useCart } from '../cart/cartStore'
import styles from './ProductsPage.module.css'

const PAGE_SIZE = 3

/** Cached product lists are considered fresh for 5 minutes; after that TanStack Query may refetch on focus/reconnect. */
const PRODUCTS_STALE_MS = 5 * 60 * 1000

const STYLE_OPTIONS = [
  { id: 'low-top-tech', label: 'Low-Top Tech' },
  { id: 'high-rise-runner', label: 'High-Rise Runner' },
  { id: 'brutalist-boot', label: 'Brutalist Boot' },
] as const

const US_SIZES = ['7', '8', '9', '10', '11', '12'] as const

const COLOR_OPTIONS = [
  { id: 'black', className: styles.swatchBlack },
  { id: 'light', className: styles.swatchLight },
  { id: 'coral', className: styles.swatchCoral },
  { id: 'lime', className: styles.swatchLime },
] as const

const TONE_CLASS: Record<ProductListingTone, string> = {
  tertiaryFixedDim: styles.toneTertiaryFixedDim,
  secondaryFixedDim: styles.toneSecondaryFixedDim,
  surfaceHighest: styles.toneSurfaceHighest,
  primaryFixed: styles.tonePrimaryFixed,
  tertiaryFixed: styles.toneTertiaryFixed,
  surfaceHigh: styles.toneSurfaceHigh,
}

function buildPageList(totalPages: number, current: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const want = new Set<number>([1, totalPages, current, current - 1, current + 1])
  const sorted = [...want].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const out: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i]!
    if (i > 0 && p - sorted[i - 1]! > 1) out.push('ellipsis')
    out.push(p)
  }
  return out
}

/** Preferred Quick Add size when no filter is active (US). */
const DEFAULT_QUICK_ADD_SIZE = '7'

function pickQuickAddSize(product: Product, sizeFilter: string | null): string | null {
  if (sizeFilter) {
    if (
      product.sizeTags?.includes(sizeFilter) &&
      !product.pdpSizesDisabled?.includes(sizeFilter)
    ) {
      return sizeFilter
    }
    return null
  }
  if (
    product.sizeTags?.includes(DEFAULT_QUICK_ADD_SIZE) &&
    !product.pdpSizesDisabled?.includes(DEFAULT_QUICK_ADD_SIZE)
  ) {
    return DEFAULT_QUICK_ADD_SIZE
  }
  return product.sizeTags?.find((s) => !product.pdpSizesDisabled?.includes(s)) ?? null
}

/** Under-title line: follows size filter / default Quick Add (e.g. `Orange / 9`). */
function listingVariantSubtitle(product: Product, sizeFilter: string | null): string | undefined {
  const sz = pickQuickAddSize(product, sizeFilter)
  if (sz && product.variantLineBySize?.[sz]) return product.variantLineBySize[sz]
  if (sz && product.variantLine) {
    const parts = product.variantLine.split(' / ')
    if (parts.length >= 2) return `${parts[0]!.trim()} / ${sz}`
  }
  return product.variantLine
}

export function ProductsPage() {
  const cart = useCart()
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  /** At most one size; `null` = no size filter (show all per catalog rules). */
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const filterPayload = useMemo(
    () => ({
      styles: selectedStyles.length ? selectedStyles : undefined,
      sizes: selectedSizeFilter ? [selectedSizeFilter] : undefined,
      colors: selectedColors.length ? selectedColors : undefined,
    }),
    [selectedColors, selectedSizeFilter, selectedStyles],
  )

  const productsQueryKey = useMemo(
    () =>
      [
        'catalog',
        'products',
        {
          styles: filterPayload.styles?.length ? [...filterPayload.styles].sort() : [],
          sizes: filterPayload.sizes ?? [],
          colors: filterPayload.colors?.length ? [...filterPayload.colors].sort() : [],
        },
      ] as const,
    [filterPayload],
  )

  const {
    data: products,
    error: queryError,
    isError,
    isPending,
  } = useQuery({
    queryKey: productsQueryKey,
    queryFn: () => catalog.listProducts(filterPayload),
    staleTime: PRODUCTS_STALE_MS,
  })

  const errorMessage = isError
    ? queryError instanceof Error
      ? queryError.message
      : 'Failed to load products'
    : null

  useEffect(() => {
    setPage(1)
  }, [filterPayload])

  const totalPages = useMemo(() => {
    if (!products) return 1
    return Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  }, [products])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageSlice = useMemo(() => {
    if (!products) return []
    const start = (page - 1) * PAGE_SIZE
    return products.slice(start, start + PAGE_SIZE)
  }, [page, products])

  const pageNumbers = useMemo(() => buildPageList(totalPages, page), [totalPages, page])

  const toggleStyle = useCallback((id: string) => {
    setSelectedStyles((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }, [])

  const selectSizeFilter = useCallback((size: string) => {
    setSelectedSizeFilter((prev) => (prev === size ? null : size))
  }, [])

  const toggleColor = useCallback((id: string) => {
    setSelectedColors((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }, [])

  const resetFilters = useCallback(() => {
    setSelectedStyles([])
    setSelectedSizeFilter(null)
    setSelectedColors([])
  }, [])

  const count = products?.length ?? 0

  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Shop All</h1>
        <div className={styles.metaRow}>
          <span className={styles.archivePill}>Archive: Vol 04</span>
          <span className={styles.count}>{count} Items Found</span>
        </div>
      </header>

      {errorMessage ? <div className={styles.alert}>{errorMessage}</div> : null}

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Product filters">
          <div className={styles.sticky}>
            <div className={styles.filterHead}>
              <h3>Filters</h3>
            </div>

            <div className={styles.block}>
              <p className={styles.blockTitle}>Style</p>
              <div className={styles.checkboxList}>
                {STYLE_OPTIONS.map((opt) => (
                  <label key={opt.id} className={styles.checkboxLabel}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={selectedStyles.includes(opt.id)}
                      onChange={() => toggleStyle(opt.id)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={`${styles.block}`} style={{ paddingTop: 8 }}>
              <p className={styles.blockTitle}>Size (US)</p>
              <div className={styles.sizeGrid}>
                {US_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`${styles.sizeBtn} ${selectedSizeFilter === size ? styles.sizeBtnActive : ''}`}
                    onClick={() => selectSizeFilter(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${styles.block}`} style={{ paddingTop: 8 }}>
              <p className={styles.blockTitle}>Color</p>
              <div className={styles.colorRow}>
                {COLOR_OPTIONS.map(({ id, className }) => (
                  <button
                    key={id}
                    type="button"
                    title={id === 'lime' ? 'Lime / volt' : id.charAt(0).toUpperCase() + id.slice(1)}
                    className={`${styles.colorBtn} ${className} ${selectedColors.includes(id) ? styles.colorBtnActive : ''}`}
                    onClick={() => toggleColor(id)}
                  />
                ))}
              </div>
            </div>

            <button type="button" className={styles.resetBtn} onClick={resetFilters}>
              Reset All
            </button>
          </div>
        </aside>

        <div className={styles.gridCol}>
          {isPending && !products ? <div className={styles.skeleton}>Loading…</div> : null}

          {products && pageSlice.length === 0 ? (
            <div className={styles.skeleton}>No products match these filters.</div>
          ) : null}

          {products && pageSlice.length > 0 ? (
            <>
              <div className={styles.grid}>
                {pageSlice.map((p) => {
                  const img = p.images[0]
                  const inStock = p.inStock !== false
                  const quickAddSize = pickQuickAddSize(p, selectedSizeFilter)
                  const quickAddDisabled = quickAddSize === null
                  const variantSubtitle = listingVariantSubtitle(p, selectedSizeFilter)
                  const tone = p.listingTone ?? 'surfaceHigh'
                  const toneClass = TONE_CLASS[tone]
                  const badge = p.listingBadge

                  return (
                    <article key={p.id} className={styles.card}>
                      <div className={styles.cardMedia}>
                        {img ? (
                          <Link
                            to={`/products/${p.slug}`}
                            className={styles.cardMediaLink}
                            aria-label={`View ${p.title}`}
                          >
                            <img
                              src={img.src}
                              alt={img.alt}
                              referrerPolicy="no-referrer"
                            />
                          </Link>
                        ) : null}
                        {badge?.kind === 'new_release' ? (
                          <span className={`${styles.badge} ${styles.badgeNew}`}>
                            {badge.label ?? 'New Release'}
                          </span>
                        ) : null}
                        {badge?.kind === 'sold_out' ? (
                          <span className={`${styles.badge} ${styles.badgeSold}`}>
                            {badge.label ?? 'Sold Out'}
                          </span>
                        ) : null}
                      </div>

                      <div
                        className={`${styles.cardBody} ${toneClass} ${!inStock ? styles.footerDim : ''}`}
                      >
                        <div className={styles.cardHeader}>
                          <div>
                            <h2 className={styles.productTitle}>
                              <Link to={`/products/${p.slug}`} className={styles.titleLink}>
                                {p.title}
                              </Link>
                            </h2>
                            {variantSubtitle ? (
                              <p className={styles.variant}>{variantSubtitle}</p>
                            ) : null}
                          </div>
                          <span className={styles.price}>
                            {formatMoney(Math.round(p.price.amount), p.price.currency)}
                          </span>
                        </div>

                        {inStock ? (
                          <button
                            type="button"
                            className={styles.btnPrimary}
                            disabled={quickAddDisabled}
                            onClick={() => {
                              if (quickAddSize === null) return
                              if (p.shopifyVariantIdsBySize) {
                                const vid = p.shopifyVariantIdsBySize[quickAddSize]
                                if (vid) {
                                  cart.add(p, 1, {
                                    selectedSize: quickAddSize,
                                    selectedVariantId: vid,
                                  })
                                  return
                                }
                              }
                              cart.add(p, 1, { selectedSize: quickAddSize })
                            }}
                          >
                            Quick Add
                          </button>
                        ) : (
                          <button type="button" className={styles.btnDisabled} disabled>
                            Out of Stock
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>

              {totalPages > 1 ? (
                <nav className={styles.pagination} aria-label="Pagination">
                  <button
                    type="button"
                    className={styles.pageBtnIcon}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      arrow_back
                    </span>
                  </button>
                  <div className={styles.pageNums}>
                    {pageNumbers.map((entry, idx) =>
                      entry === 'ellipsis' ? (
                        <span key={`e-${idx}`} className={styles.ellipsis}>
                          …
                        </span>
                      ) : (
                        <button
                          key={entry}
                          type="button"
                          className={`${styles.pageNum} ${entry === page ? styles.pageNumActive : ''}`}
                          onClick={() => setPage(entry)}
                        >
                          {entry}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.pageBtnIcon}
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      arrow_forward
                    </span>
                  </button>
                </nav>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
