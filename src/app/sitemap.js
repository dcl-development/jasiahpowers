import { isLaunchTimeReached } from '@/lib/storeLaunch'

export const dynamic = 'force-dynamic'

const BASE = 'https://www.jasiahpowers.com'

export default function sitemap() {
  const paths = [
    '/',
    '/projects',
    '/photos',
    '/prints',
    '/video',
    '/contact',
  ]

  if (isLaunchTimeReached()) {
    paths.push('/shop')
  }

  const now = new Date()
  return paths.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
  }))
}
