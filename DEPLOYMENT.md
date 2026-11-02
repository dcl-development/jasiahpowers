# Jasiah Powers Portfolio — Deployment

## Stack

- **Frontend**: Next.js 14 (App Router), React 18
- **CMS**: Sanity. The studio is embedded in the site at `/studio` (`/admin` redirects there). The `studio/` folder still runs on its own with `npm run dev`.
- **Content API**: `@sanity/client` from Next.js server components
- **Images**: Sanity CDN (`urlFor` / `cdn.sanity.io`), sized with `auto=format`
- **Booking**: `POST /api/booking` sends mail with Resend
- **Hosting**: Vercel
- **Video page**: YouTube Data API, server-side only

## Repository layout

```
jasiahpowers/
├── src/app/           # Next.js App Router. Site chrome is in (site)/
├── src/app/studio/    # Embedded Sanity Studio
├── src/components/
├── src/lib/           # Sanity client + queries
├── public/
├── studio/            # Standalone Studio (same schema and config)
└── package.json
```

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
                     # Studio: http://localhost:3000/studio

cd studio && npm install && npm run dev   # standalone Studio, base path /studio
```

Copy `.env.example` to `.env.local`.

## Vercel

Framework preset: **Next.js** (repo root).

Environment variables:

- `RESEND_API_KEY` — server-only. Required for the booking form to send mail. Without it, the form falls back to email.
- `BOOKING_TO_EMAIL` — optional. Defaults to the client's booking email (see the client row in Notion).
- `BOOKING_FROM_EMAIL` — optional. Defaults to `onboarding@resend.dev` when unset. Production uses the verified sender.
- `YOUTUBE_API_KEY` — server-only. Required for `/video`.
- Optional: `YOUTUBE_PLAYLIST_ID`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`

Homepage featured work is the ordered `featuredProjects` list on the Homepage document in Studio. If that list is empty, the home page shows every project.

*Last updated: October 2026*
