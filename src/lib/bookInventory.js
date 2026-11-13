import { client, sanityFetch } from '@/lib/sanity'
import { bookPageInventoryQuery } from '@/lib/queries'
import { MAX_COPIES_PER_ORDER } from '@/lib/bookConstants'
import {
  BOOK_CHECKOUT_METADATA,
  getStripe,
  LOW_STOCK_THRESHOLD,
} from '@/lib/stripe'

export const BOOK_PAGE_ID = 'book-page-singleton'

function sessionQuantity(session) {
  const fromMeta = Number(session?.metadata?.quantity)
  if (Number.isFinite(fromMeta) && fromMeta > 0) return fromMeta
  return 1
}

export async function reservedOpenCopies(stripe) {
  if (!stripe) return 0
  let reserved = 0
  let startingAfter
  for (let page = 0; page < 5; page += 1) {
    const list = await stripe.checkout.sessions.list({
      status: 'open',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    for (const session of list.data) {
      if (session.metadata?.product === BOOK_CHECKOUT_METADATA) {
        reserved += sessionQuantity(session)
      }
    }
    if (!list.has_more) break
    startingAfter = list.data[list.data.length - 1]?.id
  }
  return reserved
}

/* Paid checkouts from the last hour whose webhook has not been recorded in Sanity yet. */
export async function paidUnrecordedCopies(stripe, processedIds = []) {
  if (!stripe) return 0
  const processed = new Set(processedIds)
  const since = Math.floor(Date.now() / 1000) - 60 * 60
  let pending = 0
  let startingAfter
  for (let page = 0; page < 5; page += 1) {
    const list = await stripe.checkout.sessions.list({
      status: 'complete',
      created: { gte: since },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    for (const session of list.data) {
      if (
        session.metadata?.product === BOOK_CHECKOUT_METADATA &&
        session.payment_status === 'paid' &&
        !processed.has(session.id)
      ) {
        pending += sessionQuantity(session)
      }
    }
    if (!list.has_more) break
    startingAfter = list.data[list.data.length - 1]?.id
  }
  return pending
}

/*
 * strict: used by checkout. Reads Sanity live (no CDN), counts paid-but-unrecorded
 * orders, and throws if anything cannot be checked so checkout refuses instead of guessing.
 * Non-strict: used for page display; tolerates errors.
 */
export async function getBookInventoryState({ strict = false } = {}) {
  let record = null
  if (strict) {
    record = await client
      .withConfig({ useCdn: false })
      .fetch(bookPageInventoryQuery)
    if (!record) throw new Error('Book inventory record missing')
  } else {
    try {
      record = await sanityFetch(bookPageInventoryQuery)
    } catch {
      record = null
    }
  }

  const starting = Number(record?.startingInventory ?? 0)
  const sold = Number(record?.unitsSold ?? 0)
  const paused = Boolean(record?.pauseSales)

  const stripe = getStripe()
  let reserved = 0
  let pendingPaid = 0
  if (stripe) {
    if (strict) {
      ;[reserved, pendingPaid] = await Promise.all([
        reservedOpenCopies(stripe),
        paidUnrecordedCopies(stripe, record?.processedCheckoutSessionIds),
      ])
    } else {
      try {
        reserved = await reservedOpenCopies(stripe)
      } catch {
        reserved = 0
      }
    }
  } else if (strict) {
    throw new Error('Stripe not configured')
  }

  const remaining = Math.max(0, starting - sold - reserved - pendingPaid)
  const soldOut = remaining <= 0 || paused
  const showRemaining = !soldOut && remaining <= LOW_STOCK_THRESHOLD

  return {
    starting,
    sold,
    reserved,
    pendingPaid,
    remaining,
    soldOut,
    showRemaining,
    paused,
    record,
  }
}

export function quantityLimit(remaining) {
  return Math.min(Math.max(0, remaining), MAX_COPIES_PER_ORDER)
}
