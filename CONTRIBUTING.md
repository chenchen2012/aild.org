# Contributing

## Repo layout

This project's source of truth is:

- `origin` -> `git@github.com:chenchen2012/aild.org.git`

## Hosting

The site no longer depends on Netlify CMS or `/admin`.

Production hosting:

- Cloudflare Pages for build + hosting
- Cloudflare DNS/proxy for the `aild.org` domain

Cloudflare Pages compatibility files live in:

- `public/_redirects`
- `public/_headers`

These are the production redirect/header rules for Pages.

## Deploy workflow

1. Make changes in this repo.
2. Commit and push to `origin/main`.
3. GitHub Actions workflow `Deploy To Cloudflare Pages` builds the site and deploys `dist` to the `aild-org` Pages project.
4. Cloudflare serves production on `aild.org` and `www.aild.org`.

## Commands

Install dependencies:

```bash
npm ci
```

Run the regression test for the weekly brief generator:

```bash
npm run test:weekly-brief
```

Run a production build check:

```bash
npm run build
```

## Weekly brief generator note

The generator lives in `scripts/auto-weekly-brief.mjs`.

It includes normalization logic to prevent escaped newlines like `\\n-` from leaking into rendered bullet lists. Keep `npm run test:weekly-brief` passing when editing that script.

## Astro cache note

If Astro reports duplicate content IDs for files that only exist once, the cause may be stale local cache in `.astro/` rather than a real duplicate file.

Safe recovery:

1. Move `.astro/` out of the repo root instead of deleting it outright.
2. Re-run `npm run build`.
3. If the warning disappears, the cache backup can be removed later.
