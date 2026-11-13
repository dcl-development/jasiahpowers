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
 * Only paid copies count against stock: unitsSold in Sanity plus paid orders
 * whose webhook hasn't landed yet. Open (unpaid) checkouts hold nothing.
 * If anything can't be checked, fall back to what we know and let the sale through.
 * live: read Sanity without the CDN (used by checkout).
 */
export async function getBookInventoryState({ live = false } = {}) {
  let record = null
  try {
    record = live
      ? await client.withConfig({ useCdn: false }).fetch(bookPageInventoryQuery)
      : await sanityFetch(bookPageInventoryQuery)
  } catch {
    record = null
  }

  const starting = Number(record?.startingInventory ?? 0)
  const sold = Number(record?.unitsSold ?? 0)
  const paused = Boolean(record?.pauseSales)

  let pendingPaid = 0
  const stripe = getStripe()
  if (live && stripe && record) {
    try {
      pendingPaid = await paidUnrecordedCopies(
        stripe,
        record.processedCheckoutSessionIds
      )
    } catch {
      pendingPaid = 0
    }
  }

  const remaining = Math.max(0, starting - sold - pendingPaid)
  /* No record means we couldn't read Sanity: don't call it sold out. */
  const soldOut = record ? remaining <= 0 || paused : false
  const showRemaining = !soldOut && record && remaining <= LOW_STOCK_THRESHOLD

  return {
    starting,
    sold,
    pendingPaid,
    remaining: record ? remaining : MAX_COPIES_PER_ORDER,
    soldOut,
    showRemaining: Boolean(showRemaining),
    paused,
    record,
  }
}

export function quantityLimit(remaining) {
  return Math.min(Math.max(0, remaining), MAX_COPIES_PER_ORDER)
}
