# AGENTS.md — jasiahpowers

Portfolio site for Jasiah Powers (photos, prints, projects, video, booking). Content is in Sanity.

## Stack
- Next.js 16 (App Router), React 19, JavaScript (no TypeScript), styled-components.
- Sanity project `k4dm6cys`, dataset `production`. Studio is embedded at `/studio` (`/admin` redirects). Hosted studio name: `jasiahpowers`.
- Booking: `POST /api/booking` via Resend. `/video` uses the YouTube Data API on the server.
- Vercel (`vercel.json`: npm install, npm run build).

## Layout
- `src/app/(site)/` pages: home, `photos/`, `prints/`, `projects/`, `video/`, `shop/`, `contact/`. `src/app/(studio)/` embedded Studio. `src/app/api/booking/`, `src/app/api/shop/` (checkout; copies sold are counted from Stripe).
- `src/components/` (`projects/`, `photos/`), `src/lib/` Sanity client and queries.
- `studio/` standalone Studio with its **own** package.json (Sanity 6). Schema: homePage, photo, project, siteSettings. `photoGallery` and `siteSettings` are singletons.
- `scripts/migrate-handoff.mjs` one-off content migration. `scripts/seed-book-page.mjs` seeds the Book singleton. `DEPLOYMENT.md` has the full deploy notes.

## Commands
- `npm run install-all` (root + studio), `npm run dev` (:3000, Studio at /studio), `npm run build`, `npm run lint`.
- Standalone Studio (local dev only): `cd studio && npm run dev`. The only deployed Studio is the embedded one at jasiahpowers.com/studio; there is no hosted *.sanity.studio.

## Env
- `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are required (no hardcoded fallbacks). Set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` to the same values for the Studio CLI. `RESEND_API_KEY` (without it the form falls back to email), `YOUTUBE_API_KEY` (needed for /video). Book checkout (test mode): `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_SHIPPING_RATE_ID`. Optional: `BOOKING_TO_EMAIL`, `BOOKING_FROM_EMAIL`, `YOUTUBE_PLAYLIST_ID`, `NEXT_PUBLIC_SITE_URL`. Regenerate Sanity types with `npm run typegen` after query or schema changes.

## Gotchas
- Two Sanity installs: the root app and `studio/` each have their own (both Sanity 6, React 19). `next.config.mjs` forces root `node_modules` so `/studio` doesn't pull the `studio/` copy into the app build. Don't remove that webpack override.
- `.gitmodules` lists old `jacobdcl/server` and `public_html` submodules that aren't in the tree. Ignore them.
