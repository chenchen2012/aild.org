import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

function buildContentId(prefix: string, entry: string, data: Record<string, unknown>) {
  const rawSlug = typeof data.slug === 'string' && data.slug.trim().length > 0 ? data.slug : entry.replace(/\.[^.]+$/, '');
  const normalizedSlug = rawSlug.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  return `${prefix}/${normalizedSlug}`;
}

const docSchema = z.object({
  title: z.string(),
  seoTitle: z.string().optional(),
  description: z.string(),
  pillarHref: z.string().optional(),
  pillarLabel: z.string().optional(),
  pillarSummary: z.string().optional(),
  pubDate: z.string(),
  updatedDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  audience: z.string().optional(),
  readingTime: z.string().optional(),
  keyTakeaways: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
});

const docs = defineCollection({
  loader: glob({
    base: new URL('./content/docs/', import.meta.url),
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry, data }) => buildContentId('en', entry, data),
  }),
  schema: docSchema,
});

const zhdocs = defineCollection({
  loader: glob({
    base: new URL('./content/zhdocs/', import.meta.url),
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry, data }) => buildContentId('zh', entry, data),
  }),
  schema: docSchema,
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedDate: z.string().optional(),
    heroEyebrow: z.string(),
    heroTitle: z.string(),
    heroLead: z.string(),
    primaryCtaLabel: z.string().optional(),
    primaryCtaHref: z.string().optional(),
    secondaryCtaLabel: z.string().optional(),
    secondaryCtaHref: z.string().optional(),
    cards: z
      .array(
        z.object({
          tag: z.string().optional(),
          title: z.string(),
          text: z.string(),
          result: z.string().optional(),
        }),
      )
      .default([]),
    sections: z
      .array(
        z.object({
          heading: z.string(),
          text: z.string().optional(),
          bullets: z.array(z.string()).default([]),
        }),
      )
      .default([]),
  }),
});

export const collections = { docs, zhdocs, pages };
