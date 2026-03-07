# Contributing

## Repo layout

This project has two GitHub repos:

- Primary working repo: `chenchen2012/aild.org`
- Netlify-connected repo: `chenchen2012/AILD`

Local remotes are configured as:

- `origin` -> `git@github.com:chenchen2012/aild.org.git`
- `netlify-origin` -> `git@github.com:chenchen2012/AILD.git`

## Recommended workflow

1. Make changes in this repo.
2. Commit and push to `origin/main`.
3. The GitHub Actions workflow `Mirror To Netlify Repo` in `chenchen2012/aild.org` mirrors `main` to `chenchen2012/AILD`.
4. Netlify watches `chenchen2012/AILD` and deploys production from that mirrored commit.

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
