import { next } from '@vercel/functions';

/**
 * Per-page Open Graph tags for portfolio detail pages.
 *
 * The site is a static SPA, so non-JS social crawlers (WhatsApp, Facebook,
 * LinkedIn, …) see the same baseline OG tags for every route. This middleware
 * intercepts ONLY `/portfolio/:slug` and ONLY for known crawler user-agents,
 * fetches that collection from the API, and injects its title/description/cover
 * into a copy of index.html. Everything else — real users, errors, unknown
 * slugs, a sleeping backend — falls straight through to `next()`, i.e. the
 * normal SPA with the default branded OG card. It can never break a page.
 */

const API = 'https://obkmedia-api.onrender.com';
const DEFAULT_OG = 'https://res.cloudinary.com/dvoqbonr2/image/upload/obkmedia/og-card.jpg';
const CRAWLER =
  /facebookexternalhit|facebookcatalog|WhatsApp|Twitterbot|LinkedInBot|Slackbot|Slack-ImgProxy|TelegramBot|Discordbot|Pinterest|redditbot|Googlebot|bingbot|Applebot|vkShare|Embedly|W3C_Validator|SkypeUriPreview|Iframely|Bluesky/i;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Replace the content of a <meta property|name="key"> tag (single- or multi-line). */
function setMeta(html: string, attr: 'property' | 'name', key: string, value: string): string {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`, 'i');
  return re.test(html) ? html.replace(re, `$1${value}$2`) : html;
}

interface PortfolioItem {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  coverImageUrl?: string;
}

export default async function middleware(request: Request) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!CRAWLER.test(ua)) return next();

    const url = new URL(request.url);
    const slug = url.pathname.replace(/^\/portfolio\/?/, '').replace(/\/+$/, '');
    if (!slug || slug.includes('/')) return next();

    // Bound the API call so a cold backend can't hang the crawler.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    let item: PortfolioItem | undefined;
    try {
      const apiRes = await fetch(`${API}/api/public/portfolio/${encodeURIComponent(slug)}`, {
        headers: { accept: 'application/json' },
        signal: ctrl.signal,
      });
      if (!apiRes.ok) return next();
      item = ((await apiRes.json()) as { item?: PortfolioItem }).item;
    } finally {
      clearTimeout(timer);
    }
    if (!item?.title) return next();

    const htmlRes = await fetch(new URL('/index.html', url.origin));
    if (!htmlRes.ok) return next();
    let html = await htmlRes.text();

    const title = esc(`${item.title} | OBK MEDIA`);
    const desc = esc(
      (item.shortDescription || item.fullDescription || 'Professional photography and visual storytelling — OBK MEDIA, Kumasi, Ghana.').slice(0, 300),
    );
    const img = esc(item.coverImageUrl || DEFAULT_OG);
    const pageUrl = esc(url.href.replace(/^http:/, 'https:'));

    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
    html = setMeta(html, 'name', 'description', desc);
    html = setMeta(html, 'property', 'og:title', title);
    html = setMeta(html, 'property', 'og:description', desc);
    html = setMeta(html, 'property', 'og:image', img);
    html = setMeta(html, 'property', 'og:url', pageUrl);
    html = setMeta(html, 'property', 'og:image:alt', title);
    html = setMeta(html, 'name', 'twitter:title', title);
    html = setMeta(html, 'name', 'twitter:description', desc);
    html = setMeta(html, 'name', 'twitter:image', img);

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        'x-og-injected': slug,
      },
    });
  } catch {
    return next();
  }
}

export const config = {
  matcher: '/portfolio/:path*',
  runtime: 'edge',
};
