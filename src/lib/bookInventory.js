import { client, sanityFetch } from '@/lib/sanity'
import { bookPageInventoryQuery } from '@/lib/queries'
import { MAX_COPIES_PER_ORDER } from '@/lib/bookConstants'
import {
  BOOK_CHECKOUT_METADATA,
  getStripe,
  LOW_STOCK_THRESHOLD,
} from '@/lib/stripe'

/*
 * Stripe is the source of truth for copies sold: we add up the quantity of every
 * paid book checkout, skipping fully refunded ones. Sanity only holds the starting
 * inventory and the pause switch. If a count can't be read, the sale goes through.
 */

const DISPLAY_CACHE_MS = 5000
let displayCache = { at: 0, sold: null }

function sessionQuantity(session) {
  const fromMeta = Number(session?.metadata?.quantity)
  if (Number.isFinite(fromMeta) && fromMeta > 0) return fromMeta
  return 1
}

function isFullyRefunded(session) {
  const charge = session?.payment_intent?.latest_charge
  return Boolean(charge && typeof charge === 'object' && charge.refunded)
}

export async function paidCopiesFromStripe(stripe) {
  let sold = 0
  let startingAfter
  for (let page = 0; page < 30; page += 1) {
    const list = await stripe.checkout.sessions.list({
      status: 'complete',
      limit: 100,
      expand: ['data.payment_intent.latest_charge'],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    for (const session of list.data) {
      if (
        session.metadata?.product === BOOK_CHECKOUT_METADATA &&
        session.payment_status === 'paid' &&
        !isFullyRefunded(session)
      ) {
        sold += sessionQuantity(session)
      }
    }
    if (!list.has_more) break
    startingAfter = list.data[list.data.length - 1]?.id
  }
  return sold
}

async function copiesSold({ live }) {
  const stripe = getStripe()
  if (!stripe) return null
  if (!live && displayCache.sold !== null && Date.now() - displayCache.at < DISPLAY_CACHE_MS) {
    return displayCache.sold
  }
  try {
    const sold = await paidCopiesFromStripe(stripe)
    displayCache = { at: Date.now(), sold }
    return sold
  } catch {
    return null
  }
}

/* live: skip caches (used by checkout). Page display may be up to a few seconds old. */
export async function getBookInventoryState({ live = false } = {}) {
  let record = null
  try {
    record = live
      ? await client.withConfig({ useCdn: false }).fetch(bookPageInventoryQuery)
      : await sanityFetch(bookPageInventoryQuery)
  } catch {
    record = null
  }

  const sold = await copiesSold({ live })
  const known = Boolean(record) && sold !== null

  const starting = Number(record?.startingInventory ?? 0)
  const paused = Boolean(record?.pauseSales)
  const remaining = known ? Math.max(0, starting - sold) : MAX_COPIES_PER_ORDER
  const soldOut = paused || (known && remaining <= 0)
  const showRemaining = known && !soldOut && remaining <= LOW_STOCK_THRESHOLD

  return { starting, sold, remaining, soldOut, showRemaining, paused, record }
}

export function quantityLimit(remaining) {
  return Math.min(Math.max(0, remaining), MAX_COPIES_PER_ORDER)
}
