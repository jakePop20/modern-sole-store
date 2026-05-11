/** Locale-aware money string for Storefront prices (any ISO 4217 code). */
export function formatMoney(amount: number, currencyCode: string): string {
  const code = currencyCode.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(code))
    return `${currencyCode} ${amount.toFixed(2)}`
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
    }).format(amount)
  } catch {
    return `${code} ${amount.toFixed(2)}`
  }
}
