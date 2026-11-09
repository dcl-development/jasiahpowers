import Stripe from 'stripe'

export const BOOK_CHECKOUT_METADATA = 'book'
export { MAX_COPIES_PER_ORDER } from '@/lib/bookConstants'
export const CHECKOUT_RESERVATION_MINUTES = 30
export const LOW_STOCK_THRESHOLD = 10

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key)
}

export function bookStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_ID &&
      process.env.STRIPE_SHIPPING_RATE_ID
  )
}
