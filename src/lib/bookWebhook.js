import { BOOK_PAGE_ID } from '@/lib/bookInventory'
import { getSanityWriteClient } from '@/lib/sanityWrite'

function sessionQuantity(session) {
  const fromMeta = Number(session?.metadata?.quantity)
  if (Number.isFinite(fromMeta) && fromMeta > 0) return fromMeta
  return 1
}

export async function markBookCheckoutPaid(session) {
  const client = getSanityWriteClient()
  if (!client) return { ok: false, reason: 'no_write_token' }

  const sessionId = session?.id
  if (!sessionId) return { ok: false, reason: 'no_session' }

  const doc = await client.fetch(
    `*[_id == $id][0]{unitsSold, processedCheckoutSessionIds}`,
    { id: BOOK_PAGE_ID }
  )
  if (!doc) return { ok: false, reason: 'no_book_doc' }

  const processed = doc.processedCheckoutSessionIds || []
  if (processed.includes(sessionId)) {
    return { ok: true, duplicate: true }
  }

  const qty = sessionQuantity(session)
  const nextSold = Number(doc.unitsSold || 0) + qty

  await client
    .patch(BOOK_PAGE_ID)
    .setIfMissing({ processedCheckoutSessionIds: [] })
    .set({ unitsSold: nextSold })
    .append('processedCheckoutSessionIds', [sessionId])
    .commit({ visibility: 'async' })

  return { ok: true, quantity: qty }
}
