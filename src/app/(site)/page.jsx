import HomePage from '@/components/HomePage'
import { sanityFetch } from '@/lib/sanity'
import {
  bookHomeAnnouncementQuery,
  homePageQuery,
  projectsQuery,
  siteSettingsQuery,
} from '@/lib/queries'
import { youtubeId } from '@/lib/site'
import { isStoreOpen } from '@/lib/storeLaunch'
import { cookies } from 'next/headers'

export const revalidate = 60

export default async function Page() {
  const [home, allProjects, settings, book] = await Promise.all([
    sanityFetch(homePageQuery),
    sanityFetch(projectsQuery),
    sanityFetch(siteSettingsQuery),
    sanityFetch(bookHomeAnnouncementQuery),
  ])

  const picked = (home?.featuredProjects || []).filter((project) => project?._id)
  const projects = picked.length ? picked : allProjects || []

  const cookieStore = await cookies()
  const storeOpen = isStoreOpen(cookieStore)
  const announcementText = book?.showHomeAnnouncement
    ? book?.homeAnnouncementText?.trim() || ''
    : ''

  return (
    <HomePage
      title={settings?.title || 'Jasiah Powers'}
      videoId={youtubeId(home?.featuredVideo?.videoId)}
      welcomeMessage={home?.welcomeMessage || ''}
      projects={projects}
      announcementText={announcementText}
      storeOpen={storeOpen}
    />
  )
}
