import { createClient } from '@sanity/client'
import { dataset, projectId } from '@/lib/sanity'

export function getSanityWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!token) return null
  return createClient({
    projectId,
    dataset,
    apiVersion: '2023-05-03',
    token,
    useCdn: false,
  })
}
