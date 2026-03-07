// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aild.org',
  integrations: [
    sitemap({
      filter: (page) => !['https://aild.org/en/', 'https://aild.org/es/'].includes(page),
    }),
  ],
});
