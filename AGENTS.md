# AGENTS.md — jasiahpowers

Portfolio site for Jasiah Powers (photos, prints, projects, video, booking). Content is in Sanity.

## Dev framework

This repo follows Jake's dev framework: [jakedcl/dev-framework](https://github.com/jakedcl/dev-framework) (start at its `AGENTS.md`). The framework is the source of truth; if anything in this file conflicts with it, the framework wins.

The framework repo is private. Cloud agents open it with `git clone --depth 1 https://x-access-token:${DEV_FRAMEWORK_READ_TOKEN}@github.com/jakedcl/dev-framework /tmp/dev-framework` (the token is a Cursor secret; never print or commit it).

## Stack
- Next.js 16 (App Router), React 19, JavaScript (no TypeScript), styled-components.
- Sanity project `k4dm6cys`, dataset `production`. Studio is embedded at `/studio` (`/admin` redirects). Hosted studio name: `jasiahpowers`.
- Booking: `POST /api/booking` via Resend. `/video` uses the YouTube Data API on the server.
- Vercel (`vercel.json`: npm install, npm run build).

## Layout
- `src/app/(site)/` pages: home, `photos/`, `prints/`, `projects/`, `video/`, `contact/`. `src/app/(studio)/` embedded Studio. `src/app/api/booking/`.
- `src/components/` (`projects/`, `photos/`), `src/lib/` Sanity client and queries.
- `studio/` standalone Studio with its **own** package.json (Sanity 6). Schema: homePage, photo, project, siteSettings. `photoGallery` and `siteSettings` are singletons.
- `scripts/migrate-handoff.mjs` one-off content migration. `DEPLOYMENT.md` has the full deploy notes.

## Commands
- `npm run install-all` (root + studio), `npm run dev` (:3000, Studio at /studio), `npm run build`, `npm run lint`.
- Standalone Studio: `cd studio && npm run dev`; `npm run deploy` there publishes the hosted Studio.

## Env
- `RESEND_API_KEY` (without it the form falls back to email), `YOUTUBE_API_KEY` (needed for /video). Optional: `BOOKING_TO_EMAIL`, `BOOKING_FROM_EMAIL`, `YOUTUBE_PLAYLIST_ID`.

## Gotchas
- Two Sanity installs: the root app and `studio/` each have their own (both Sanity 6, React 19). `next.config.mjs` forces root `node_modules` so `/studio` doesn't pull the `studio/` copy into the app build. Don't remove that webpack override.
- `.gitmodules` lists old `jacobdcl/server` and `public_html` submodules that aren't in the tree. Ignore them.
