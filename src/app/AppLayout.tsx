import { NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../cart/cartStore'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const cart = useCart()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/" className={styles.brand}>
            MODERN SOLE
          </NavLink>
          <nav className={styles.nav} aria-label="Main">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              Drops
            </NavLink>
          </nav>
          <div className={styles.actions}>
            <NavLink
              to="/cart"
              className={`${styles.iconButton} ${styles.cartLink}`}
              aria-label={
                cart.totalItems > 0
                  ? `Shopping bag, ${cart.totalItems} items`
                  : 'Shopping bag'
              }
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                shopping_bag
              </span>
              {cart.totalItems > 0 ? (
                <span className={styles.cartBadge} aria-hidden="true">
                  {cart.totalItems > 99 ? '99+' : cart.totalItems}
                </span>
              ) : null}
            </NavLink>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div
              style={{
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase',
                color: 'var(--on-surface)',
              }}
            >
              MODERN SOLE
            </div>
            <div>
              Crafting the future of urban mobility through high-performance footwear and
              brutalist design language.
            </div>
            <div>© 2026 MODERN SOLE. ALL RIGHTS RESERVED.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
