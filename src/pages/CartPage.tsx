import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../catalog/types'
import { catalog } from '../catalog/catalog'
import { cartLineKey } from '../cart/cartLine'
import { useCart } from '../cart/cartStore'
import { formatMoney } from '../lib/formatMoney'
import {
  createShopifyCheckoutUrl,
  resolveCartLineVariantId,
} from '../lib/shopifyCheckout'
import styles from './CartPage.module.css'

const TAX_RATE = 0.08
const SUGGEST_LIMIT = 8

function productTypeLine(product: Product) {
  if (product.variantLine)
    return `TYPE: ${product.variantLine.toUpperCase()}`
  const primary = product.styleTags?.[0]
  if (primary) return `TYPE: ${primary.toUpperCase()}`
  return 'TYPE: FOOTWEAR'
}

export function CartPage() {
  const cart = useCart()
  const [catalogProducts, setCatalogProducts] = useState<Product[] | null>(null)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const checkoutBlocked = useMemo(() => {
    for (const item of cart.items) {
      if (!resolveCartLineVariantId(item)) {
        return `Choose a size with inventory for “${item.product.title}” (mock-only products cannot use Shopify checkout).`
      }
    }
    return null
  }, [cart.items])

  useEffect(() => {
    let cancelled = false
    setCatalogError(null)
    catalog
      .listProducts()
      .then((items) => {
        if (!cancelled) setCatalogProducts(items)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setCatalogError(e instanceof Error ? e.message : 'Failed to load products')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const cartProductIds = useMemo(
    () => new Set(cart.items.map((i) => i.product.id)),
    [cart.items],
  )

  const shoeSuggestions = useMemo(() => {
    if (!catalogProducts) return []
    return catalogProducts.filter((p) => !cartProductIds.has(p.id)).slice(0, SUGGEST_LIMIT)
  }, [catalogProducts, cartProductIds])

  const subtotal = cart.items.reduce(
    (sum, i) => sum + i.quantity * i.product.price.amount,
    0,
  )
  const estimatedTax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = subtotal + estimatedTax
  const totalLines = cart.totalItems

  const cartCurrency =
    cart.items[0]?.product.price.currency?.trim().toUpperCase() ?? 'USD'

  async function handleCheckout() {
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const url = await createShopifyCheckoutUrl(cart.items)
      window.location.assign(url)
    } catch (e: unknown) {
      setCheckoutError(e instanceof Error ? e.message : 'Checkout failed')
      setCheckoutLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          YOUR BAG{' '}
          {totalLines > 0 ? (
            <span className={styles.count}>({totalLines})</span>
          ) : null}
        </h1>
        {cart.items.length > 0 ? (
          <button type="button" className={styles.clearLink} onClick={cart.clear}>
            Clear bag
          </button>
        ) : null}
      </div>

      {!cart.items.length ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Your bag is empty</h2>
          <p className={styles.emptyText}>
            Add a drop from the archive. Checkout sends you to Shopify when items use live variant
            IDs from the Storefront catalog (dev proxy uses your app&apos;s OAuth token).
          </p>
          <Link to="/products" className={styles.emptyCta}>
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            <div className={styles.list}>
              {cart.items.map((item) => {
                const lk = cartLineKey(
                  item.product.id,
                  item.selectedSize,
                  item.selectedVariantId,
                )
                const img = item.product.images[0]
                const lineTotal = item.quantity * item.product.price.amount
                const sizeLabel = item.selectedSize
                  ? `US ${item.selectedSize}`
                  : '—'

                return (
                  <article key={lk} className={styles.lineCard}>
                    <div className={styles.thumbWrap}>
                      {img ? (
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </div>
                    <div className={styles.lineBody}>
                      <div className={styles.lineTop}>
                        <div>
                          <h2 className={styles.lineTitle}>{item.product.title}</h2>
                          <p className={styles.type}>{productTypeLine(item.product)}</p>
                          <div className={styles.metaRow}>
                            <div className={styles.metaBlock}>
                              <span className={styles.metaLabel}>Size</span>
                              <span className={styles.metaValue}>{sizeLabel}</span>
                            </div>
                            <div className={styles.metaBlock}>
                              <span className={styles.metaLabel}>Qty</span>
                              <div className={styles.qtyControl}>
                                <button
                                  type="button"
                                  className={styles.qtyBtn}
                                  aria-label="Decrease quantity"
                                  disabled={item.quantity <= 1}
                                  onClick={() =>
                                    cart.setQuantity(
                                      item.product.id,
                                      item.quantity - 1,
                                      item.selectedSize,
                                      item.selectedVariantId,
                                    )
                                  }
                                >
                                  −
                                </button>
                                <span className={styles.metaValue} aria-live="polite">
                                  {String(item.quantity).padStart(2, '0')}
                                </span>
                                <button
                                  type="button"
                                  className={styles.qtyBtn}
                                  aria-label="Increase quantity"
                                  onClick={() =>
                                    cart.setQuantity(
                                      item.product.id,
                                      item.quantity + 1,
                                      item.selectedSize,
                                      item.selectedVariantId,
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.linePrice}>
                          {formatMoney(lineTotal, item.product.price.currency)}
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.actionLink}
                          onClick={() =>
                            cart.remove(
                              item.product.id,
                              item.selectedSize,
                              item.selectedVariantId,
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className={styles.summaryWrap}>
              <div className={styles.summary}>
                <h2 className={styles.summaryTitle}>Order summary</h2>
                <div className={styles.summaryLines}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal, cartCurrency)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping (standard)</span>
                    <span className={styles.free}>FREE</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Estimated tax</span>
                    <span>{formatMoney(estimatedTax, cartCurrency)}</span>
                  </div>
                </div>
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span>{formatMoney(total, cartCurrency)}</span>
                </div>
                <button
                  type="button"
                  className={styles.checkoutBtn}
                  disabled={checkoutBlocked !== null || checkoutLoading}
                  title={checkoutBlocked ?? undefined}
                  onClick={() => void handleCheckout()}
                >
                  {checkoutLoading ? 'Redirecting…' : 'Proceed to checkout'}
                </button>
                {checkoutError ? (
                  <p className={styles.checkoutError} role="alert">
                    {checkoutError}
                  </p>
                ) : null}
                {checkoutBlocked ? (
                  <p className={styles.checkoutHint}>{checkoutBlocked}</p>
                ) : null}
                <p className={styles.payNote}>
                  Secure checkout on Shopify — Apple Pay, cards, and more.
                </p>
                <Link to="/products" className={styles.continue}>
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>

          <section className={styles.suggestSection} aria-labelledby="suggested-shoes-heading">
            <div className={styles.suggestHead}>
              <h2 id="suggested-shoes-heading" className={styles.suggestTitle}>
                More sneakers
              </h2>
              <p className={styles.suggestSub}>
                Picked from the catalog — anything already in your bag is hidden here.
              </p>
              {catalogError ? (
                <p className={styles.suggestLoading} role="alert">
                  {catalogError}
                </p>
              ) : null}
              {!catalogProducts && !catalogError ? (
                <p className={styles.suggestLoading}>Loading suggestions…</p>
              ) : null}
            </div>
            {catalogProducts && shoeSuggestions.length > 0 ? (
              <div className={styles.suggestGrid}>
                {shoeSuggestions.map((p) => {
                  const img = p.images[0]
                  return (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      className={styles.suggestCard}
                      aria-label={`View ${p.title}`}
                    >
                      <div className={styles.suggestImgWrap}>
                        {img ? (
                          <img
                            src={img.src}
                            alt={img.alt}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                      </div>
                      <div className={styles.suggestBar}>
                        <span className={styles.suggestName}>{p.title}</span>
                        <span className={styles.suggestPrice}>
                          {formatMoney(p.price.amount, p.price.currency)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : null}
            {catalogProducts && shoeSuggestions.length === 0 && !catalogError ? (
              <p className={styles.suggestLoading}>
                You&apos;ve already got everything on the shelf —
                {' '}
                <Link to="/products" className={styles.continue}>
                  browse the full catalog
                </Link>
                .
              </p>
            ) : null}
          </section>
        </>
      )}
    </div>
  )
}
