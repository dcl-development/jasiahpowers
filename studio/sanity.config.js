import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {StudioIcon} from './icon'

const SINGLETONS = new Set(['homePage', 'photoGallery', 'siteSettings', 'bookPage'])

export default defineConfig({
  name: 'default',
  title: 'Jasiah Powers',
  icon: StudioIcon,
  basePath: '/studio',
  // Hide Sanity's "What's new" product popups so the client never sees them.
  announcements: {enabled: false},

  projectId: 'k4dm6cys',
  dataset: 'production',

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
