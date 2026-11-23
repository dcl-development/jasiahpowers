import {defineCliConfig} from 'sanity/cli'

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset =
  process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
  typegen: {
    path: '../src/**/*.{ts,tsx,js,jsx}',
    schema: '../schema.json',
    generates: '../sanity.types.ts',
  },
})
