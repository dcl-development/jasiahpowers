import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {StudioIcon} from './icon'

const SINGLETONS = new Set(['homePage', 'photoGallery', 'siteSettings', 'bookPage'])

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_STUDIO_PROJECT_ID')
}
if (!dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET or SANITY_STUDIO_DATASET')
}

export default defineConfig({
  name: 'default',
  title: 'Jasiah Powers',
  icon: StudioIcon,
  basePath: '/studio',
  // Hide Sanity's "What's new" product popups so the client never sees them.
  announcements: {enabled: false},
  releases: {enabled: false},
  scheduledDrafts: {enabled: false},
  tasks: {enabled: false},

  projectId,
  dataset,

  plugins: [structureTool({structure})],

  schema: {
    types: schemaTypes,
  },

  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((item) => !SINGLETONS.has(item.templateId))
      }
      return prev
    },
    actions: (prev, {schemaType}) => {
      if (!SINGLETONS.has(schemaType)) return prev
      return prev.filter((action) => {
        const name = action.action || action.name
        return name !== 'delete' && name !== 'duplicate'
      })
    },
  },
})
