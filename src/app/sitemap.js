export const dynamic = 'force-dynamic'

const BASE = 'https://www.jasiahpowers.com'

export default function sitemap() {
  const paths = [
    '/',
    '/projects',
    '/photos',
    '/shop',
    '/video',
    '/contact',
  ]

  const now = new Date()
  return paths.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
  }))
}
