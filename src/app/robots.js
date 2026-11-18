/** @returns {import('next').MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/admin/'],
    },
    sitemap: 'https://www.jasiahpowers.com/sitemap.xml',
  }
}
