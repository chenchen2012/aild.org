export function buildCollectionEntryId(prefix: 'en' | 'zh', slug: string) {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  return `${prefix}/${normalizedSlug}`;
}

export function publicEntrySlug(entry: { slug: string; id: string }) {
  return entry.slug || entry.id.replace(/^[^/]+\//, '');
}
