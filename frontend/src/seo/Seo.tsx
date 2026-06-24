import { useEffect } from 'react';
import { BRAND } from '../content';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

const DEFAULT_DESCRIPTION = `${BRAND.intro} ${BRAND.seoKeyword} and nationwide coverage.`;

// 1200×630 branded social-share card (matches the static default in index.html).
const DEFAULT_OG_IMAGE = 'https://obkmedia.com/og-cover.jpg';

export default function Seo({ title, description, image, type = 'website' }: SeoProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${BRAND.name}`
      : `${BRAND.name} — ${BRAND.tagline} | ${BRAND.seoKeyword}`;
    const desc = description ?? DEFAULT_DESCRIPTION;
    const img = image ?? DEFAULT_OG_IMAGE;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:image', img);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', window.location.href);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', img);
  }, [title, description, image, type]);

  return null;
}
