# Contributing

## Repo layout

This project currently has two GitHub repos:

- Primary working repo: `chenchen2012/aild.org`
- Legacy Netlify-connected repo: `chenchen2012/AILD`

Local remotes are configured as:

- `origin` -> `git@github.com:chenchen2012/aild.org.git`
- `netlify-origin` -> `git@github.com:chenchen2012/AILD.git`

## Hosting direction

The site no longer depends on Netlify CMS or `/admin`.

Recommended hosting target:

- Cloudflare Pages for build + hosting
- Cloudflare DNS/proxy for the `aild.org` domain

Cloudflare Pages compatibility files live in:

- `public/_redirects`
- `public/_headers`

These mirror the redirect/header behavior that previously lived in `netlify.toml`.

## Current workflow

1. Make changes in this repo.
2. Commit and push to `origin/main`.
3. Until the Pages cutover is complete, the GitHub Actions workflow `Mirror To Netlify Repo` in `chenchen2012/aild.org` mirrors `main` to `chenchen2012/AILD`.
4. Netlify watches `chenchen2012/AILD` and deploys production from that mirrored commit.

## Planned cutover

After Cloudflare Pages is connected:

1. Point the Pages project at `chenchen2012/aild.org`.
2. Use build command `npm run build`.
3. Use build output directory `dist`.
4. Move the `aild.org` custom domain from Netlify to Pages.
5. Remove the legacy mirror workflow and `netlify-origin` remote.

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
