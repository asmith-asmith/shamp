// Single source of the shipping policy. All amounts are integer cents.
// Keep this module dependency-free so client components, route handlers,
// and `tsx --test` can all import it.

export const FREE_SHIPPING_THRESHOLD = 5000
export const FLAT_SHIPPING_COST = 500

export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD
}

export function getShippingCost(subtotal: number): number {
  return qualifiesForFreeShipping(subtotal) ? 0 : FLAT_SHIPPING_COST
}

export function getFreeShippingRemaining(subtotal: number): number {
  return Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)
}

export function getFreeShippingProgress(subtotal: number): number {
  return Math.min(Math.max(subtotal, 0) / FREE_SHIPPING_THRESHOLD, 1)
}

function formatDollars(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`
}

export function getFreeShippingMessage(subtotal: number): string {
  if (qualifiesForFreeShipping(subtotal)) {
    return 'You’ve unlocked free shipping!'
  }
  return `Add ${formatDollars(getFreeShippingRemaining(subtotal))} more for free shipping.`
}
