import { BOOK_PAGE_ID } from '@/lib/bookInventory'
import { getSanityWriteClient } from '@/lib/sanityWrite'

function sessionQuantity(session) {
  const fromMeta = Number(session?.metadata?.quantity)
  if (Number.isFinite(fromMeta) && fromMeta > 0) return fromMeta
  return 1
}

const MAX_ATTEMPTS = 8

/*
 * Atomic increment guarded by the document revision: if another webhook wrote
 * first, Sanity rejects this patch and we re-read and retry, so concurrent
 * payments can never overwrite each other's count.
 */
export async function markBookCheckoutPaid(session) {
  const client = getSanityWriteClient()
  if (!client) throw new Error('Sanity write token missing')

  const sessionId = session?.id
  if (!sessionId) return { ok: false, reason: 'no_session' }
  const qty = sessionQuantity(session)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const doc = await client.fetch(
      `*[_id == $id][0]{_rev, processedCheckoutSessionIds}`,
      { id: BOOK_PAGE_ID }
    )
    if (!doc) throw new Error('Book document missing')

    if ((doc.processedCheckoutSessionIds || []).includes(sessionId)) {
      return { ok: true, duplicate: true }
    }

    try {
      await client
        .patch(BOOK_PAGE_ID)
        .ifRevisionId(doc._rev)
        .setIfMissing({ unitsSold: 0, processedCheckoutSessionIds: [] })
        .inc({ unitsSold: qty })
        .append('processedCheckoutSessionIds', [sessionId])
        .commit({ visibility: 'sync' })
      return { ok: true, quantity: qty }
    } catch (err) {
      const status = err?.statusCode || err?.response?.statusCode
      if (status !== 409) throw err
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 200))
    }
  }
  throw new Error('Could not record book sale after retries')
}
