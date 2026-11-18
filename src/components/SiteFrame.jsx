import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MotionMain from '@/components/motion/MotionMain'
import { sanityFetch } from '@/lib/sanity'
import { siteSettingsQuery } from '@/lib/queries'
import { FALLBACK_MUSIC, socialLinks } from '@/lib/site'

export default async function SiteFrame({ children }) {
  let settings = null
  try {
    settings = await sanityFetch(siteSettingsQuery)
  } catch {
    settings = null
  }

  const title = settings?.title || 'Jasiah Powers'
  const musicLink = settings?.musicLink || FALLBACK_MUSIC

  return (
    <div className="site-shell">
      <Header title={title} musicLink={musicLink} />
      <main id="content" className="site-main">
        <MotionMain>{children}</MotionMain>
      </main>
      <Footer social={socialLinks(settings)} />
    </div>
  )
}
