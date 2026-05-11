import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Reset window scroll on every navigation. Uses `location.key` (not just `pathname`) so
 * returning from `/products/:id` to `/products` still runs when the path matches a prior visit.
 * `history.scrollRestoration = 'manual'` stops the browser from re-applying the old list scroll
 * after the Back button (common without this).
 */
export function ScrollToTop() {
  const { key } = useLocation()

  useEffect(() => {
    const prev = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => {
      history.scrollRestoration = prev
    }
  }, [])

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [key])

  return null
}
