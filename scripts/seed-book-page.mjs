/**
 * Creates or patches the Book singleton in Sanity production.
 *
 *   SANITY_API_WRITE_TOKEN=your-token node scripts/seed-book-page.mjs
 */

import { createClient } from '@sanity/client'

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN
const docId = 'book-page-singleton'

const base = {
  _type: 'bookPage',
  _id: docId,
  title: "Let's figure it out",
  priceLabel: '$85',
  supportEmail: 'jasiahsteez@gmail.com',
  shippingSummary:
    'US shipping addresses only. USPS Media Mail, $6 flat. Copies ship within 7 days.',
  refundSummary:
    'If a copy arrives damaged, email within 7 days of delivery for a refund or replacement.',
  startingInventory: 100,
  pauseSales: false,
}

if (!projectId || !dataset) {
  console.error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET (or SANITY_STUDIO_*).'
  )
  process.exit(1)
}

if (!token) {
  console.error('No write token. Set SANITY_API_WRITE_TOKEN and run again.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-10-28',
  token,
  useCdn: false,
})

const existing = await client.fetch('*[_id == $id][0]._id', { id: docId })
if (existing) {
  await client.patch(docId).set(base).commit()
  console.log('Updated Book singleton.')
} else {
  await client.createOrReplace(base)
  console.log('Created Book singleton.')
}
