/**
 * One-time handoff migration for the configured Sanity project and dataset.
 *
 * - Seeds orderRank from the old Display Order number.
 * - Turns any plain-text project descriptions into Portable Text blocks.
 * - Clears social links that are only a generic homepage.
 *
 *   SANITY_API_WRITE_TOKEN=your-token node scripts/migrate-handoff.mjs
 *
 * The token needs Editor access. Create one at
 * https://www.sanity.io/manage
 */

import { createClient } from '@sanity/client'
import { LexoRank } from 'lexorank'
import { randomBytes } from 'node:crypto'

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN

const GENERIC = new Set([
  'https://twitter.com',
  'https://www.twitter.com',
  'https://x.com',
  'https://www.x.com',
  'https://youtube.com',
  'https://www.youtube.com',
  'https://tiktok.com',
  'https://www.tiktok.com',
  'https://instagram.com',
  'https://www.instagram.com',
])

function key() {
  return randomBytes(6).toString('hex')
}

function textToBlocks(text) {
  return String(text)
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ({
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: key(),
          text: part.replace(/\s*\n\s*/g, ' '),
          marks: [],
        },
      ],
    }))
}

function ranksFor(count) {
  let rank = LexoRank.min()
  const ranks = []
  for (let index = 0; index < count; index += 1) {
    rank = rank.genNext().genNext()
    ranks.push(rank.toString())
  }
  return ranks
}

function bare(url) {
  return String(url || '').trim().replace(/\/+$/, '')
}

if (!projectId || !dataset) {
  console.error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET (or SANITY_STUDIO_*).'
  )
  process.exit(1)
}

if (!token) {
  console.error(
    'No write token. Run: SANITY_API_WRITE_TOKEN=… node scripts/migrate-handoff.mjs'
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-10-28',
  token,
  useCdn: false,
})

const projects = await client.fetch(
  `*[_type == "project"] | order(order asc, _createdAt asc) {
    _id, name, order, orderRank, description
  }`
)

const missing = projects.filter((project) => !project.orderRank)
const ranks = ranksFor(missing.length)
const rankById = new Map(missing.map((project, index) => [project._id, ranks[index]]))
let transaction = client.transaction()
let changes = 0

projects.forEach((project) => {
  const nextRank = rankById.get(project._id)
  const patch = {}
  if (nextRank) patch.orderRank = nextRank
  if (typeof project.description === 'string' && project.description.trim()) {
    patch.description = textToBlocks(project.description)
  }
  if (!Object.keys(patch).length) return
  transaction = transaction.patch(project._id, (builder) => builder.set(patch))
  changes += 1
  console.log(`${project.name}: ${nextRank || 'text only'}`)
})

const settings = await client.fetch(`*[_type == "siteSettings"][0]{
  _id, socialLinks
}`)

if (settings?._id && settings.socialLinks) {
  const unset = []
  for (const name of ['instagram', 'twitter', 'youtube', 'tiktok']) {
    const value = bare(settings.socialLinks[name])
    if (value && GENERIC.has(value)) unset.push(`socialLinks.${name}`)
  }
  if (unset.length) {
    transaction = transaction.patch(settings._id, (builder) => builder.unset(unset))
    changes += 1
    console.log(`Site settings: clear ${unset.join(', ')}`)
  }
}

if (!changes) {
  console.log('Nothing to migrate.')
  process.exit(0)
}

await transaction.commit()
console.log(`Updated ${changes} document${changes === 1 ? '' : 's'}.`)
