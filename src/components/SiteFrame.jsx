import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MotionMain from '@/components/motion/MotionMain'
import { sanityFetch } from '@/lib/sanity'
import { siteSettingsQuery } from '@/lib/queries'
import { FALLBACK_MUSIC, socialLinks } from '@/lib/site'
import { getLaunchAtIso, isStoreOpen } from '@/lib/storeLaunch'
import { cookies } from 'next/headers'

export default async function SiteFrame({ children }) {
  let settings = null
  try {
    settings = await sanityFetch(siteSettingsQuery)
  } catch {
    settings = null
  }

  const title = settings?.title || 'Jasiah Powers'
  const musicLink = settings?.musicLink || FALLBACK_MUSIC
  const cookieStore = await cookies()
  const storeOpen = isStoreOpen(cookieStore)
  const launchAt = getLaunchAtIso()

  return (
    <div className="site-shell">
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__JP_STORE_LAUNCH__=${JSON.stringify(launchAt)};`,
        }}
      />
      <Header title={title} musicLink={musicLink} storeOpen={storeOpen} />
      <main id="content" className="site-main">
        <MotionMain>{children}</MotionMain>
      </main>
      <Footer social={socialLinks(settings)} />
    </div>
  )
}
