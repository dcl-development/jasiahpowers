import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
}
if (!dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
}

export { projectId, dataset }

export const client = createClient({
  projectId,
  dataset,
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2026-10-28',
  perspective: 'published',
})

const builder = createImageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}

export async function sanityFetch(query, params = {}) {
  return client.fetch(query, params)
}
