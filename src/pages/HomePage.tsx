import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { catalog } from '../catalog/catalog'
import type { ProductListingTone } from '../catalog/types'
import { formatMoney } from '../lib/formatMoney'
import home from './HomePage.module.css'

const TICKER_PHRASES = [
  'Limited Edition',
  'Hyper-Responsive Tech',
  'Modern Sole Architecture',
  'Streetwear',
  'Global Archive',
] as const

/** Align cache window with products listing. */
const HOME_PRODUCTS_STALE_MS = 5 * 60 * 1000

const FALLBACK_HANDLE = import.meta.env.VITE_DEFAULT_PRODUCT_HANDLE ?? 'kinetik-v1'

const LARGE_BAR: Record<ProductListingTone, string> = {
  tertiaryFixedDim: home.barTertiary,
  secondaryFixedDim: home.barPrimary,
  surfaceHighest: home.barTertiary,
  primaryFixed: home.barPrimary,
  tertiaryFixed: home.barTertiary,
  surfaceHigh: home.barPrimary,
}

const SMALL_BAR_STYLES = [
  { background: 'var(--secondary-fixed-dim)', color: 'var(--on-secondary-fixed)' },
  { background: 'var(--on-surface)', color: 'var(--background)' },
  { background: 'var(--primary-container)', color: 'var(--on-primary-container)' },
] as const

function plainDescription(html: string, max: number): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

function splitHeroTitle(title: string): { line1: string; line2: string } {
  const parts = title.trim().split(/\s+/)
  if (parts.length <= 1) return { line1: '', line2: title.trim() }
  return { line1: parts[0]!, line2: parts.slice(1).join(' ') }
}

function largeBarClass(tone: ProductListingTone | undefined): string {
  if (tone && LARGE_BAR[tone]) return LARGE_BAR[tone]
  return home.barTertiary
}

function TickerContent() {
  return (
    <>
      {TICKER_PHRASES.flatMap((phrase, i) => [
        <span key={`phrase-${phrase}-${i}`} className={home.tickerText}>
          {phrase}
        </span>,
        <span key={`sep-${phrase}-${i}`} className={home.tickerDot} aria-hidden="true">
          •
        </span>,
      ])}
    </>
  )
}

export function HomePage() {
  const { data: products, isPending, isError, error } = useQuery({
    queryKey: ['catalog', 'home', 'products'],
    queryFn: () => catalog.listProducts(),
    staleTime: HOME_PRODUCTS_STALE_MS,
  })

  const list = products ?? []
  const heroProduct = list[0]
  const featured = list.slice(0, 6)
  const p0 = featured[0]
  const p1 = featured[1]
  const smallRow = featured.slice(2, 5)

  const fallbackPdp = `/products/${FALLBACK_HANDLE}`
  const showTrendingGrid = !isPending && !isError

  return (
    <div className={home.page}>
      <section className={home.heroSection}>
        {isPending ? (
          <>
            <div>
              <div className={home.pill}>New Arrival</div>
              <div className={home.heroSkeleton} style={{ height: 72, marginTop: 16 }} />
              <div className={home.heroSkeleton} style={{ height: 96, marginTop: 16 }} />
              <div className={home.heroSkeleton} style={{ height: 64, marginTop: 24 }} />
            </div>
            <div className={home.heroImgSkeleton} aria-hidden />
          </>
        ) : heroProduct ? (
          <>
            <div>
              <div className={home.pill}>New Arrival</div>
              <h1 className={home.heroTitle}>
                {(() => {
                  const { line1, line2 } = splitHeroTitle(heroProduct.title)
                  return line1 ? (
                    <>
                      {line1} <br /> <span className={home.accent}>{line2}</span>
                    </>
                  ) : (
                    <span className={home.accent}>{line2}</span>
                  )
                })()}
              </h1>
              <p className={home.heroCopy}>
                {plainDescription(heroProduct.description, 240) ||
                  heroProduct.variantLine ||
                  'Engineered drop from the archive.'}
              </p>
              <div className={home.ctaRow}>
                <Link to={`/products/${heroProduct.slug}`} className={home.cta}>
                  Shop the Drop <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
            <Link
              to={`/products/${heroProduct.slug}`}
              className={home.heroVisual}
              aria-label={`View ${heroProduct.title}`}
            >
              <div className={home.glow} aria-hidden="true" />
              {heroProduct.images[0] ? (
                <img
                  className={home.heroImg}
                  alt={heroProduct.images[0].alt || heroProduct.title}
                  src={heroProduct.images[0].src}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={home.heroImgSkeleton} aria-hidden />
              )}
            </Link>
          </>
        ) : (
          <>
            <div>
              <div className={home.pill}>New Arrival</div>
              <h1 className={home.heroTitle}>
                Archive <br /> <span className={home.accent}>Drop</span>
              </h1>
              <p className={home.heroCopy}>
                Browse the catalog for live inventory from your store.
              </p>
              <div className={home.ctaRow}>
                <Link to="/products" className={home.cta}>
                  Shop All <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
            <Link to={fallbackPdp} className={home.heroVisual} aria-label="View featured product">
              <div className={home.glow} aria-hidden="true" />
              <img
                className={home.heroImg}
                alt=""
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNQHrL10WnQXBPoEYK7fl3Iq7w2pwFtyGEawnVhD8Ff-wQvKCm3wZAMJGc9KLHGVobzdsSC5FbI9p9EH2V3HM066cG7-d5qEwaeU02v4H9TZcLc0t1_mhPIA54OhaguAu6o0gYZRty7vJtnD7PSPj7ObXPfdfgvFgL7qShg2MFFBsKc4T0V_3GyVur6fTCB2EuzzG_uO6s43YrCfyHWYQfM3AlLkcCOV37gkl3C2HT7qUHsGH4h-vIyhxvipnM1A81-S3deK6M2C4"
              />
            </Link>
          </>
        )}
      </section>

      <section className={`${home.ticker} ${home.tickerBleed}`} aria-label="Brand ticker">
        <div className={home.tickerMarquee}>
          <div className={home.tickerScroll}>
            <div className={home.tickerRow}>
              <TickerContent />
            </div>
            <div className={home.tickerRow} aria-hidden="true">
              <TickerContent />
            </div>
          </div>
        </div>
      </section>

      <section className={home.section}>
        <div className={home.sectionHeader}>
          <div>
            <h2 className={home.h2}>Trending Drops</h2>
            <p className={home.sub}>Live inventory from your catalog.</p>
          </div>
          <Link to="/products" className={home.viewAll}>
            View All Drops
          </Link>
        </div>

        {isError ? (
          <p className={home.catalogError} role="alert">
            {error instanceof Error ? error.message : 'Could not load products.'}
          </p>
        ) : null}

        {isPending ? (
          <div className={home.bentoSkeleton}>
            <div className={home.skelFeature} />
            <div className={home.skelSide} />
            <div className={home.skelSmallGrid}>
              <div className={home.skelSmall} />
              <div className={home.skelSmall} />
              <div className={home.skelSmall} />
            </div>
          </div>
        ) : null}

        {showTrendingGrid && p0 ? (
          <div className={home.bento}>
            <Link
              to={`/products/${p0.slug}`}
              className={`${home.card} ${home.featureCard} ${!p1 ? home.featureCardFull : ''}`}
            >
              <div className={home.cardMedia}>
                {p0.images[0] ? (
                  <img
                    alt={p0.images[0].alt || p0.title}
                    src={p0.images[0].src}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={home.skelSmall} style={{ height: '100%', width: '100%' }} />
                )}
              </div>
              <div className={`${home.bar} ${largeBarClass(p0.listingTone)}`}>
                <span className={home.barLabel}>{p0.title}</span>
                <span className={home.price}>
                  {formatMoney(Math.round(p0.price.amount), p0.price.currency)}
                </span>
              </div>
            </Link>

            {p1 ? (
              <Link to={`/products/${p1.slug}`} className={`${home.card} ${home.sideCard}`}>
                <div className={`${home.cardMedia} ${home.cardMediaTall}`}>
                  {p1.images[0] ? (
                    <img
                      alt={p1.images[0].alt || p1.title}
                      src={p1.images[0].src}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={home.skelSmall} style={{ height: '100%', width: '100%' }} />
                  )}
                </div>
                <div className={`${home.bar} ${largeBarClass(p1.listingTone)}`}>
                  <span className={home.barLabel}>{p1.title}</span>
                  <span>{formatMoney(Math.round(p1.price.amount), p1.price.currency)}</span>
                </div>
              </Link>
            ) : null}

            {smallRow.length > 0 ? (
              <div className={home.smallGrid}>
                {smallRow.map((p, i) => (
                  <Link key={p.id} to={`/products/${p.slug}`} className={home.smallCard}>
                    {p.images[0] ? (
                      <img
                        alt={p.images[0].alt || p.title}
                        src={p.images[0].src}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={home.skelSmall} />
                    )}
                    <div
                      className={home.smallBar}
                      style={{
                        background: SMALL_BAR_STYLES[i % 3].background,
                        color: SMALL_BAR_STYLES[i % 3].color,
                      }}
                    >
                      <span className={home.barLabel}>{p.title}</span>
                      <span>{formatMoney(Math.round(p.price.amount), p.price.currency)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {showTrendingGrid && !p0 ? (
          <p className={home.catalogError}>No products in the catalog yet.</p>
        ) : null}
      </section>

      <section className={home.newsletter}>
        <div className={home.newsletterInner}>
          <h2 className={home.newsletterTitle}>Never Miss a Drop.</h2>
          <p className={home.newsletterCopy}>
            Join the inner circle for early access, exclusive drops, and ARCHIVE members-only
            pricing.
          </p>
          <form
            className={home.formRow}
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <input className={home.input} type="email" placeholder="EMAIL ADDRESS" />
            <button className={home.join} type="submit">
              Join
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
