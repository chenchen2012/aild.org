// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = 'https://aild.org';
const pageLastmod = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/page-lastmod.json'), 'utf8'));
const excludedSitemapPaths = new Set([
  '/en/',
  '/es/',
  '/brief-subscribe-success/',
  '/checklist-success/',
  '/contact-success/',
  '/zh/brief-subscribe-success/',
  '/zh/checklist-success/',
  '/zh/contact-success/',
]);

function readCollectionDates(collectionDir, urlPrefix) {
  const dir = path.join(rootDir, collectionDir);
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const map = new Map();
  let latest = null;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const fullPath = path.join(dir, entry.name);
    const source = fs.readFileSync(fullPath, 'utf8');
    const updated = source.match(/^updatedDate:\s*['"]?([^'"\n]+)['"]?/m)?.[1];
    const published = source.match(/^pubDate:\s*['"]?([^'"\n]+)['"]?/m)?.[1];
    const dateValue = updated ?? published;
    if (!dateValue) continue;

    const iso = new Date(dateValue).toISOString();
    const slug = entry.name.replace(/\.md$/, '');
    map.set(`${siteUrl}${urlPrefix}${slug}/`, iso);

    if (!latest || iso > latest) {
      latest = iso;
    }
  }

  return { map, latest };
}

const englishDocs = readCollectionDates('src/content/docs', '/learn/');
const chineseDocs = readCollectionDates('src/content/zhdocs', '/zh/learn/');
const managedPages = readCollectionDates('src/content/pages', '/');

const sitemapLastmod = new Map([
  ...englishDocs.map,
  ...chineseDocs.map,
  ...managedPages.map,
]);

for (const [pagePath, lastmod] of Object.entries(pageLastmod)) {
  sitemapLastmod.set(`${siteUrl}${pagePath}`, lastmod);
}

if (englishDocs.latest) {
  sitemapLastmod.set(`${siteUrl}/`, englishDocs.latest);
  sitemapLastmod.set(`${siteUrl}/learn/`, englishDocs.latest);
}

if (chineseDocs.latest) {
  sitemapLastmod.set(`${siteUrl}/zh/`, chineseDocs.latest);
  sitemapLastmod.set(`${siteUrl}/zh/learn/`, chineseDocs.latest);
}

export default defineConfig({
  site: 'https://aild.org',
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        if (excludedSitemapPaths.has(pathname)) return false;
        if (pathname.startsWith('/learn/weekly-ai-leadership-brief-')) return false;
        if (pathname.startsWith('/zh/learn/weekly-ai-leadership-brief-')) return false;
        return true;
      },
      serialize: (item) => {
        const lastmod = sitemapLastmod.get(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});
