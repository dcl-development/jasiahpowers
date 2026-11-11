import HomePage from '@/components/HomePage'
import { sanityFetch } from '@/lib/sanity'
import {
  bookHomeAnnouncementQuery,
  homePageQuery,
  projectsQuery,
  siteSettingsQuery,
} from '@/lib/queries'
import { youtubeId } from '@/lib/site'

export const revalidate = 60

const DEFAULT_COUNTDOWN_PREFIX = "Let's Figure It Out drops in"

export default async function Page() {
  const [home, allProjects, settings, book] = await Promise.all([
    sanityFetch(homePageQuery),
    sanityFetch(projectsQuery),
    sanityFetch(siteSettingsQuery),
    sanityFetch(bookHomeAnnouncementQuery),
  ])

  const picked = (home?.featuredProjects || []).filter((project) => project?._id)
  const projects = picked.length ? picked : allProjects || []

  return (
    <HomePage
      title={settings?.title || 'Jasiah Powers'}
      videoId={youtubeId(home?.featuredVideo?.videoId)}
      welcomeMessage={home?.welcomeMessage || ''}
      projects={projects}
      showAnnouncement={Boolean(book?.showHomeAnnouncement)}
      announcementText={book?.homeAnnouncementText?.trim() || ''}
      countdownPrefix={
        book?.homeCountdownText?.trim() || DEFAULT_COUNTDOWN_PREFIX
      }
    />
  )
}
