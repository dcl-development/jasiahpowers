import { defineQuery } from 'next-sanity'

export const projectsQuery = defineQuery(
  '*[_type == "project"] | order(orderRank asc, order asc, _createdAt desc)',
)

export const projectBySlugQuery = defineQuery(
  '*[_type == "project" && slug.current == $slug][0]',
)

export const photoGalleryQuery = defineQuery('*[_type == "photoGallery"][0]')

export const homePageQuery = defineQuery(`*[_type == "homePage"][0]{
  featuredVideo,
  welcomeMessage,
  "featuredProjects": featuredProjects[]->{
    _id,
    name,
    slug,
    bio,
    images
  }
}`)

export const bookHomeAnnouncementQuery = defineQuery(`*[_type == "bookPage"][0]{
  showHomeAnnouncement,
  homeAnnouncementText
}`)

export const bookPageQuery = defineQuery(`*[_type == "bookPage"][0]{
  title,
  description,
  photos[]{
    image,
    alt
  },
  priceLabel,
  supportEmail,
  shippingSummary,
  refundSummary,
  startingInventory,
  pauseSales,
  seoDescription
}`)

export const bookPageInventoryQuery = defineQuery(`*[_type == "bookPage"][0]{
  _id,
  startingInventory,
  pauseSales
}`)

export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  title,
  contactEmail,
  musicLink,
  youtubePlaylist,
  bookingTypes,
  seoDescription,
  shareImage,
  socialLinks
}`)
