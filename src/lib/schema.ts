type SchemaItem = {
  name: string;
  url: string;
  description?: string;
};

const SITE_URL = 'https://aild.org';

export function absoluteUrl(path: string) {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

export function buildCollectionPageSchema({
  name,
  description,
  url,
  items = [],
}: {
  name: string;
  description: string;
  url: string;
  items?: SchemaItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(url),
    hasPart: items.map((item) => ({
      '@type': 'WebPage',
      name: item.name,
      url: absoluteUrl(item.url),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

export function buildItemListSchema({
  name,
  items,
}: {
  name: string;
  items: SchemaItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(item.url),
      name: item.name,
    })),
  };
}
