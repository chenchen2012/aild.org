// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = 'https://aild.org';

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

const sitemapLastmod = new Map([
  ...englishDocs.map,
  ...chineseDocs.map,
]);

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
      filter: (page) => !['https://aild.org/en/', 'https://aild.org/es/'].includes(page),
      serialize: (item) => {
        const lastmod = sitemapLastmod.get(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});
