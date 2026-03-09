# AILD.org (Astro wiki-style content system)

This project is now an Astro-based, SEO-first site with a wiki-style internal-link content graph.

## Architecture

- `src/layouts/Layout.astro`: shared layout + metadata + navigation
- `src/content/docs/*.md`: long-form knowledge pages (cornerstone content)
- `src/pages/learn/[slug].astro`: dynamic docs route from content collection
- `src/pages/*.astro`: business and conversion pages (`playbooks`, `templates`, `cases`, `research`, `about`, `contact`)
- `src/pages/en|es|zh/index.astro`: multilingual entry pages
- `public/robots.txt`: crawler control
- `@astrojs/sitemap`: automatic sitemap generation in build

## Why this is better than pure static HTML

- Easier to add and maintain content pages
- Better internal-linking structure for SEO
- Cleaner multilingual expansion model
- Shared SEO metadata and consistent design system

## Run locally

```bash
cd /Users/cc801/Downloads/aild.org
npm install
npm run dev
```

## Build

```bash
npm run build
```

Build output is in `dist/`.

## Analytics

- GA4 is wired for lazy-load at the shared layout level.
- Default AILD GA4 Measurement ID is `G-WKLPXSSB6Z`.
- Optionally set `PUBLIC_GA_MEASUREMENT_ID` in the local environment or Cloudflare Pages to override it.
- The loader waits for first interaction or a deferred idle window before requesting `gtag.js`.

## Notes

- Previous static version is preserved in `legacy-static/`.
- Add new knowledge articles by creating Markdown files in `src/content/docs/`.
- This project no longer uses a CMS admin panel; Git-backed content files are the source of truth.
- Production hosting is Cloudflare Pages with DNS on Cloudflare.
