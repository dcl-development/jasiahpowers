import './globals.css'
import { siteFontVariables } from '@/lib/fonts'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { siteSettingsQuery } from '@/lib/queries'

export async function generateMetadata() {
  let settings = null
  try {
    settings = await sanityFetch(siteSettingsQuery)
  } catch {
    settings = null
  }

  const siteName = settings?.title?.trim() || 'Jasiah Powers'
  const description = settings?.seoDescription?.trim()
  const image = settings?.shareImage?.asset
    ? urlFor(settings.shareImage).width(1200).height(630).fit('crop').url()
    : null

  return {
    metadataBase: new URL('https://www.jasiahpowers.com'),
    title: {
      default: siteName,
      template: `%s — ${siteName}`,
    },
    ...(description ? { description } : {}),
    openGraph: {
      title: siteName,
      ...(description ? { description } : {}),
      url: 'https://www.jasiahpowers.com',
      siteName,
      type: 'website',
      locale: 'en_US',
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: siteName,
      ...(description ? { description } : {}),
      ...(image ? { images: [image] } : {}),
    },
  }
}

export const viewport = {
  themeColor: '#f2f2f0',
}

export const revalidate = 60

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={siteFontVariables}>
      <body>{children}</body>
    </html>
  )
}
