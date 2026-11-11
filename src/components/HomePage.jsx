import BookHomeAnnouncement from '@/components/book/BookHomeAnnouncement'
import HomeIntro from '@/components/HomeIntro'
import FeaturedReel from '@/components/projects/FeaturedReel'
import Reveal from '@/components/motion/Reveal'

export default function HomePage({
  title,
  videoId,
  welcomeMessage,
  projects,
  showAnnouncement = false,
  announcementText = '',
  countdownPrefix = '',
}) {
  const message = welcomeMessage?.trim()

  return (
    <div className="home">
      <BookHomeAnnouncement
        enabled={showAnnouncement}
        announcementText={announcementText}
        countdownPrefix={countdownPrefix}
      />
      <HomeIntro title={title} />
      <h1 className="visually-hidden">{title}</h1>
      {message ? (
        <Reveal>
          <p className="welcome">{message}</p>
        </Reveal>
      ) : null}
      <Reveal as="section" className="reel-section" delay={1}>
        <p className="kicker">Featured work</p>
        {projects?.length ? (
          <FeaturedReel projects={projects} />
        ) : (
          <p className="detail__empty">No projects yet.</p>
        )}
      </Reveal>
      <Reveal as="section" className="home-video" delay={2}>
        <p className="kicker">Video</p>
        <div className="video-frame">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title="YouTube video player"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Reveal>
    </div>
  )
}
