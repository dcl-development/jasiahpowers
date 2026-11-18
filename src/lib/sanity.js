import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'k4dm6cys'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const client = createClient({
  projectId,
  dataset,
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2023-05-03',
})

const builder = createImageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}

export async function sanityFetch(query, params = {}) {
  return client.fetch(query, params)
}
