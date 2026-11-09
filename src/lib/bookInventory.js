import { sanityFetch } from '@/lib/sanity'
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

export async function getBookInventoryState() {
  let record = null
  try {
    record = await sanityFetch(bookPageInventoryQuery)
  } catch {
    record = null
  }

  const starting = Number(record?.startingInventory ?? 0)
  const sold = Number(record?.unitsSold ?? 0)
  const paused = Boolean(record?.pauseSales)

  const stripe = getStripe()
  let reserved = 0
  if (stripe) {
    try {
      reserved = await reservedOpenCopies(stripe)
    } catch {
      reserved = 0
    }
  }

  const remaining = Math.max(0, starting - sold - reserved)
  const soldOut = remaining <= 0 || paused
  const showRemaining = !soldOut && remaining <= LOW_STOCK_THRESHOLD

  return {
    starting,
    sold,
    reserved,
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
